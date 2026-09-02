const localContainer = document.getElementById("videoPreview");
  const remoteContainer = document.getElementById("remotevideoPreview");

  const localVideo = document.createElement("video");
  localVideo.autoplay = true;
  localVideo.muted = true;
  localVideo.playsInline = true;

  const remoteVideo = document.createElement("video");
  remoteVideo.autoplay = true;
  remoteVideo.playsInline = true;

  // Append videos to containers
  localContainer.appendChild(localVideo);
  remoteContainer.appendChild(remoteVideo);

  let mediaStreamPromise = null;

  function requestCallMedia() {
    if (!mediaStreamPromise) {
      mediaStreamPromise = navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          localVideo.srcObject = stream;
          remoteVideo.srcObject = stream;
          return stream;
        })
        .catch((error) => {
          mediaStreamPromise = null;
          console.error("Error accessing camera:", error);
          return null;
        });
    }

    return mediaStreamPromise;
  }


  let hideTimeout = null;
  let controlsVisible = true;

  // Elements
  const topControl = document.getElementById("topControl");
  const bottomControl = document.getElementById("bottomControl");
  const videoPreview = document.getElementById("videoPreview");
  const cameraSwitch = document.getElementById("cameraSwitch");

  function isInsideControls(target) {
    return (
      topControl.contains(target) ||
      bottomControl.contains(target) ||
      videoPreview.contains(target) ||
      cameraSwitch.contains(target)
    );
  }

  function toggleControls(show) {
    controlsVisible = show;

    // Toggle controls with animation
    if (show) {
      topControl.classList.add("show");
      topControl.classList.remove("hide");
      bottomControl.classList.add("show");
      bottomControl.classList.remove("hide");
      cameraSwitch.classList.add("show");
      cameraSwitch.classList.remove("hide");

      videoPreview.classList.remove("down");
    } else {
      topControl.classList.add("hide");
      topControl.classList.remove("show");
      bottomControl.classList.add("hide");
      bottomControl.classList.remove("show");
      cameraSwitch.classList.add("hide");
      cameraSwitch.classList.remove("show");

      videoPreview.classList.add("down");
    }
  }

  function resetAutoHideTimer() {
    if (hideTimeout) clearTimeout(hideTimeout);
    if (!controlsVisible) return;
    hideTimeout = setTimeout(() => {
      toggleControls(false);
    }, 2500);
  }

  function showCallControls() {
    toggleControls(true);
    resetAutoHideTimer();

    // The start-call click bubbles to body, so restore visibility after that event finishes.
    requestAnimationFrame(() => {
      const callUI = document.getElementById("callUIContainer");
      if (callUI && !callUI.classList.contains("hidden")) {
        toggleControls(true);
        resetAutoHideTimer();
      }
    });
  }

  document.body.addEventListener("click", function (e) {
    if (isInsideControls(e.target)) return;

    if (controlsVisible) {
      toggleControls(false);
    } else {
      toggleControls(true);
      resetAutoHideTimer();
    }
  });

  document.body.addEventListener("mousemove", resetAutoHideTimer);
  document.body.addEventListener("touchstart", resetAutoHideTimer);

  toggleControls(true);
  resetAutoHideTimer();


  let seconds = 0;
    const timerEl = document.getElementById('callTimer');

    function formatTime(sec) {
      const min = String(Math.floor(sec / 60)).padStart(2, '0');
      const secs = String(sec % 60).padStart(2, '0');
      return `${min}:${secs}`;
    }

    setInterval(() => {
      seconds++;
      timerEl.textContent = formatTime(seconds);
    }, 1000);


    function switchCamera() {
      alert("Camera switched (dummy)");
    }
    

    function toggleMic(btn) {
      btn.querySelector("i").classList.toggle("fa-microphone");
      btn.querySelector("i").classList.toggle("fa-microphone-slash");
    }

 

    function toggleSpeaker(btn) {
      btn.querySelector("i").classList.toggle("fa-volume-up");
      btn.querySelector("i").classList.toggle("fa-volume-mute");

    }































    // CSS management
    // Both interface stylesheets stay loaded so switching views never flashes unstyled content.
    let callTransitionId = 0;

    function loadStylesheet() {
      return Promise.resolve();
    }

    async function endCall() {
      const transitionId = ++callTransitionId;
      await loadStylesheet('ui/chatstyle.css');
      if (transitionId !== callTransitionId) return;
      document.getElementById('appContainer').classList.remove('hidden');
      document.getElementById('callUIContainer').classList.add('hidden');
      // Reset video elements for next call
      document.getElementById('videoPreview').style.display = 'block';
      document.getElementById('remotevideoPreview').style.display = 'block';
      document.getElementById('cameraSwitch').style.display = 'block';
      // Add actual call termination logic here
    }

    // Initialize with chat styles before exposing the app.
    window.addEventListener('DOMContentLoaded', async () => {
      try {
        await loadStylesheet('ui/chatstyle.css');
      } catch (error) {
        console.error(error);
      }
    });


    // Call control functions
    async function startVideoCall() {
      const transitionId = ++callTransitionId;
      await loadStylesheet('ui/call.css');
      if (transitionId !== callTransitionId) return;
      document.getElementById('appContainer').classList.add('hidden');
      document.getElementById('callUIContainer').classList.remove('hidden');
      
      // Set initial video call state
      isVideoCall = true;
      document.getElementById('videoPreview').style.display = 'flex';
      document.getElementById('remotevideoPreview').style.display = 'flex';
      document.getElementById('cameraSwitch').style.display = 'flex';
      showCallControls();
      
      // Set video button to active state
      const videoBtn = document.querySelector('#bottomControl button:nth-child(2)');
      videoBtn.querySelector('i').className = 'fas fa-video';
      
      // Initialize video stream
      await requestCallMedia();
      initVideoStream();
    }

    async function startVoiceCall() {
      const transitionId = ++callTransitionId;
      await loadStylesheet('ui/call.css');
      if (transitionId !== callTransitionId) return;
      document.getElementById('appContainer').classList.add('hidden');
      document.getElementById('callUIContainer').classList.remove('hidden');
      
      // Set initial voice call state
      isVideoCall = false;
      document.getElementById('videoPreview').style.display = 'none';
      document.getElementById('remotevideoPreview').style.display = 'none';
      document.getElementById('cameraSwitch').style.display = 'none';
      showCallControls();
      
      // Set video button to inactive state (with slash icon)
      const videoBtn = document.querySelector('#bottomControl button:nth-child(2)');
      videoBtn.querySelector('i').className = 'fas fa-video-slash';
      
      // Initialize audio only
      initAudioStream();
    }

    function toggleVideo(btn) {
      const icon = btn.querySelector('i');
      
      if (!isVideoCall) {
        // Switch from voice to video call
        isVideoCall = true;
        icon.className = 'fas fa-video';
        document.getElementById('videoPreview').style.display = 'flex';
        document.getElementById('remotevideoPreview').style.display = 'flex';
        document.getElementById('cameraSwitch').style.display = 'flex';
        upgradeToVideoCall();
        return;
      }
      
      // Regular video toggle in video call mode
      icon.classList.toggle('fa-video');
      icon.classList.toggle('fa-video-slash');

      const isVideoOff = icon.classList.contains('fa-video-slash');
      document.getElementById('videoPreview').style.display = isVideoOff ? 'none' : 'flex';
      document.getElementById('cameraSwitch').style.display = isVideoOff ? 'none' : 'flex';
      
      if (isVideoOff) {
        stopVideoStream();
        console.log("Camera turned off");
      } else {
        startVideoStream();
        console.log("Camera turned on");
      }
    }

    // Call state variables
    let isVideoCall = false;
    
    // Stream control functions (placeholder implementations)
    function initVideoStream() {
      console.log("Initializing video stream...");
      // Actual WebRTC implementation would go here
    }
    
    function initAudioStream() {
      console.log("Initializing audio stream...");
      // Actual WebRTC implementation would go here
    }
    
    function upgradeToVideoCall() {
      console.log("Upgrading to video call...");
      // Actual WebRTC implementation would go here
      requestCallMedia();
      startVideoStream();
    }
    
    function startVideoStream() {
      console.log("Starting video stream...");
      // Actual WebRTC implementation would go here
    }
    
    function stopVideoStream() {
      console.log("Stopping video stream...");
      // Actual WebRTC implementation would go here
    }


        // Chat App Functionality
    const textarea = document.getElementById("chatInput");
    const fileInput = document.getElementById("fileInput");
    const fileInputTrigger = document.getElementById("fileInputTrigger");
    const filePreviewContainer = document.getElementById("filePreviewContainer");
    const chatArea = document.getElementById("chatArea");
    const chatScrollContainer = document.querySelector(".chat-scroll-container");
    const sendBtn = document.getElementById("sendBtn");
    let userManuallyScrolledUp = false;

    function isChatNearBottom(threshold = 48) {
      if (!chatScrollContainer) return true;
      return chatScrollContainer.scrollHeight - chatScrollContainer.scrollTop - chatScrollContainer.clientHeight <= threshold;
    }

    function scrollChatToBottom(behavior = "auto") {
      if (!chatScrollContainer) return;
      chatScrollContainer.scrollTo({
        top: chatScrollContainer.scrollHeight,
        behavior
      });
    }

    function keepMessageAtBottom(messageElement, forceFollow = false) {
      if (forceFollow || !userManuallyScrolledUp) scrollChatToBottom();
      messageElement.querySelectorAll("img, video").forEach((media) => {
        const refreshScroll = () => requestAnimationFrame(() => {
          if (forceFollow || !userManuallyScrolledUp) scrollChatToBottom();
        });
        if (media.complete || media.readyState >= 2) {
          refreshScroll();
        } else {
          media.addEventListener("load", refreshScroll, {once: true});
          media.addEventListener("error", refreshScroll, {once: true});
        }
      });
    }

    if (chatScrollContainer) {
      chatScrollContainer.addEventListener("scroll", () => {
        userManuallyScrolledUp = !isChatNearBottom();
      });
    }
    const fileModal = document.getElementById("fileModal");
    const modalContent = document.getElementById("modalContent");
    const modalTitle = document.getElementById("modalTitle");
    const closeModal = document.querySelector(".close-modal");

    let filesToSend = [];
    let sentMessages = [];

    // Auto-resize textarea
    textarea.addEventListener("input", () => {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 130);
      textarea.style.height = newHeight + "px";
      textarea.style.overflowY = newHeight >= 130 ? "auto" : "hidden";
    });

    // Keep chat input above the mobile soft keyboard without breaking the rest of the UI
    (function setupKeyboardAvoidance() {
      const inputWrapper = document.querySelector(".chat-input-wrapper");
      const appContainer = document.getElementById("appContainer");
      const scrollContainer = document.querySelector(".chat-scroll-container");
      if (!inputWrapper || !appContainer) return;

      let keyboardOpen = false;

      function applyViewportHeight() {
        const vv = window.visualViewport;
        if (!vv) return;

        // Visible height of the screen (shrinks when keyboard is open)
        const visibleH = Math.round(vv.height);
        const offsetTop = Math.round(vv.offsetTop || 0);

        // Only constrain when the visual viewport is meaningfully smaller (keyboard open)
        const keyboardLikelyOpen = visibleH < window.innerHeight - 80;

        if (keyboardLikelyOpen || keyboardOpen) {
          // Pin layout to the visible area so the input stays on screen
          document.body.style.height = visibleH + "px";
          document.body.style.maxHeight = visibleH + "px";
          // Compensate for any visualViewport offset (iOS address bar / keyboard)
          document.body.style.transform = offsetTop ? `translateY(${offsetTop}px)` : "";
          appContainer.style.height = "100%";
          if (scrollContainer) {
            // Keep latest messages visible above the input
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
          }
        } else {
          // Restore normal full-height layout
          document.body.style.height = "";
          document.body.style.maxHeight = "";
          document.body.style.transform = "";
          appContainer.style.height = "";
        }
      }

      function onFocus() {
        keyboardOpen = true;
        // Small delay so the browser finishes opening the keyboard first
        setTimeout(() => {
          applyViewportHeight();
          inputWrapper.scrollIntoView({ block: "end", behavior: "smooth" });
          if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
          }
        }, 50);
        setTimeout(applyViewportHeight, 300);
      }

      function onBlur() {
        keyboardOpen = false;
        // Delay reset so iOS finishes closing the keyboard
        setTimeout(applyViewportHeight, 100);
        setTimeout(applyViewportHeight, 350);
      }

      textarea.addEventListener("focus", onFocus);
      textarea.addEventListener("blur", onBlur);

      if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", applyViewportHeight);
        window.visualViewport.addEventListener("scroll", applyViewportHeight);
      }
      window.addEventListener("resize", applyViewportHeight);
    })();


    fileInputTrigger.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", (event) => {
      const files = Array.from(event.target.files);
      if (files.length === 0) return;
      
      files.forEach(file => {
        if (!file.type.match(/image\/.*|video\/.*|application\/pdf/)) return;
        
        filesToSend.push(file);
        const fileBox = createFilePreview(file);
        filePreviewContainer.appendChild(fileBox);
      });
      
      // Reset file input to allow selecting the same files again
      fileInput.value = '';
    });

function createFilePreview(file) {
      const fileBox = document.createElement("div");
      fileBox.classList.add("file-box");
      
      const closeBtn = document.createElement("div");
      closeBtn.classList.add("close-btn");
      closeBtn.innerText = "×";
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        fileBox.remove();
        filesToSend = filesToSend.filter(f => f !== file);
      };

      if (file.type.startsWith("image/")) {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        fileBox.appendChild(img);
        fileBox.onclick = () => previewFile(file);
      } 
      else if (file.type.startsWith("video/")) {
        const video = document.createElement("video");
        video.src = URL.createObjectURL(file);
        video.setAttribute("preload", "metadata");
        fileBox.appendChild(video);
        fileBox.onclick = () => previewFile(file);
      } 
      else if (file.type === "application/pdf") {
        const iconBox = document.createElement("div");
        iconBox.classList.add("file-icon-box");
        iconBox.innerHTML = '<i class="fas fa-file-pdf"></i>';
        fileBox.appendChild(iconBox);
        fileBox.onclick = () => previewFile(file);
      }
      
      fileBox.appendChild(closeBtn);
      return fileBox;
    }

    function previewFile(file) {
      modalContent.innerHTML = '';
      modalTitle.textContent = file.name;
      
      if (file.type.startsWith("image/")) {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        modalContent.appendChild(img);
      } 
      else if (file.type.startsWith("video/")) {
        const video = document.createElement("video");
        video.src = URL.createObjectURL(file);
        video.controls = true;
        video.autoplay = true;
        modalContent.appendChild(video);
      } 
      else if (file.type === "application/pdf") {
        const iframe = document.createElement("iframe");
        iframe.classList.add("pdf-viewer");
        iframe.src = URL.createObjectURL(file);
        modalContent.appendChild(iframe);
      }
      
      fileModal.style.display = "flex";
    }

    closeModal.addEventListener("click", () => {
      fileModal.style.display = "none";
      // Revoke object URLs to free memory
      Array.from(modalContent.children).forEach(child => {
        if (child.src) URL.revokeObjectURL(child.src);
      });
    });

    // Close modal when clicking outside content
    fileModal.addEventListener("click", (e) => {
      if (e.target === fileModal) {
        fileModal.style.display = "none";
        // Revoke object URLs to free memory
        Array.from(modalContent.children).forEach(child => {
          if (child.src) URL.revokeObjectURL(child.src);
        });
      }
    });
    // Add message to chat
    sendBtn.addEventListener("click", () => {
      const msg = textarea.value.trim();
      
      if (msg || filesToSend.length > 0) {
        if (msg) {
          const messageId = Date.now();
          addTextMessage(msg, 'sent', messageId);
          sentMessages.push({id: messageId, element: document.getElementById(`msg-${messageId}`)});
          textarea.value = "";
          textarea.style.height = "auto";
        }
        
        if (filesToSend.length > 0) {
          filesToSend.forEach(file => {
            const messageId = Date.now();
            addFileMessage(file, 'sent', messageId);
            sentMessages.push({id: messageId, element: document.getElementById(`msg-${messageId}`)});
          });
          filesToSend = [];
          filePreviewContainer.innerHTML = '';
        }
        
        scrollChatToBottom("smooth");
        
        // Simulate message being read after a delay
        setTimeout(() => {
          updateReadReceipts();
        }, 2000);
      }
    });

    // Also send message when pressing Enter (but allow Shift+Enter for new lines)
    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
      }
    });

    function addTextMessage(text, type, messageId) {
      const shouldFollow = type === "sent" || (!userManuallyScrolledUp && isChatNearBottom());
      const msgBubble = document.createElement("div");
      msgBubble.classList.add("message", type);
      msgBubble.id = `msg-${messageId}`;
      msgBubble.innerHTML = `
        ${text}
        <div class="message-time">
          ${getCurrentTime()}
          ${type === 'sent' ? '<span class="double-tick"><i class="fas fa-check-double"></i></span>' : ''}
        </div>
      `;
      chatArea.appendChild(msgBubble);
      if (shouldFollow) requestAnimationFrame(() => keepMessageAtBottom(msgBubble, type === "sent"));
    }

    function addFileMessage(file, type, messageId) {
      const shouldFollow = type === "sent" || (!userManuallyScrolledUp && isChatNearBottom());
      const fileMessage = document.createElement("div");
      fileMessage.classList.add("message", "file-message", type);
      fileMessage.id = `msg-${messageId}`;
      
      let fileContent = '';
      if (file.type.startsWith("image/")) {
        fileContent = `
          <img src="${URL.createObjectURL(file)}">
          <div class="file-info">
            <i class="fas fa-image file-icon"></i><span class="file-name">${file.name}</span>
          </div>
        `;
      } 
      else if (file.type.startsWith("video/")) {
        fileContent = `
          <video src="${URL.createObjectURL(file)}" preload="metadata"></video>
          <div class="file-info">
            <i class="fas fa-video file-icon"></i><span class="file-name">${file.name}</span>
          </div>
        `;
      } 
      else if (file.type === "application/pdf") {
        fileContent = `
          <div class="pdf-preview">
            <i class="fas fa-file-pdf" style="font-size: 40px; color: #e74c3c;"></i>
            <div style="margin-top: 8px; font-weight: bold;">${file.name}</div>
            <div style="font-size: 11px; margin-top: 4px;">PDF Document</div>
          </div>
        `;
      }
      
      fileMessage.innerHTML = `
        ${fileContent}
        <div class="message-time">
          ${getCurrentTime()}
          ${type === 'sent' ? '<span class="double-tick"><i class="fas fa-check-double"></i></span>' : ''}
        </div>
      `;
      
      fileMessage.onclick = () => {
        if (Date.now() < suppressMessageClickUntil) return;
        previewFile(file);
      };
      chatArea.appendChild(fileMessage);
      if (shouldFollow) requestAnimationFrame(() => keepMessageAtBottom(fileMessage, type === "sent"));
    }

    function getCurrentTime() {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      return `${hours}:${minutes} ${ampm}`;
    }

    function updateReadReceipts() {
      sentMessages.forEach(msg => {
        const doubleTick = msg.element.querySelector('.double-tick');
        if (doubleTick) {
          doubleTick.classList.add('read');
        }
      });
    }

    // Add online status indicator
    function addOnlineStatus() {
      const avatar = document.querySelector('.user-avatar');
      const statusDot = document.createElement('div');
      statusDot.classList.add('online-status');
      avatar.appendChild(statusDot);
    }


// Message deletion functionality
let longPressTimer;
let suppressMessageClickUntil = 0;
let selectedMessages = new Set(); // Track multiple selected messages

function setupMessageDeletion() {
  // Add event listeners to all messages
  document.addEventListener('mousedown', startLongPress);
  document.addEventListener('mouseup', cancelLongPress);
  document.addEventListener('touchstart', startLongPress);
  document.addEventListener('touchend', cancelLongPress);
  document.addEventListener('selectstart', preventMessageBrowserAction);
  document.addEventListener('dragstart', preventMessageBrowserAction);
  document.addEventListener('contextmenu', preventMessageBrowserAction);
  
  // Add click handlers for delete options
  document.getElementById('deleteForMe').addEventListener('click', () => deleteMessages(false));
  document.getElementById('deleteForEveryone').addEventListener('click', () => deleteMessages(true));
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.delete-menu') && !e.target.closest('.message-selected')) {
      clearSelection();
    }
  });
}

function preventMessageBrowserAction(e) {
  if (e.target.closest('.message')) e.preventDefault();
}

function startLongPress(e) {
  const messageElement = e.target.closest('.message');
  if (!messageElement) return;
  
  if (e.target.closest('.file-preview')) return;
  
  longPressTimer = setTimeout(() => {
    suppressMessageClickUntil = Date.now() + 800;
    toggleMessageSelection(messageElement);
  }, 1000);
}

function cancelLongPress() {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
}

function toggleMessageSelection(messageElement) {
  messageElement.classList.toggle('message-selected');
  
  if (messageElement.classList.contains('message-selected')) {
    selectedMessages.add(messageElement);
  } else {
    selectedMessages.delete(messageElement);
  }
  
  // Show delete menu if we have selections
  if (selectedMessages.size > 0) {
    showDeleteMenu();
  } else {
    hideDeleteMenu();
  }
}

function showDeleteMenu() {
  const menu = document.getElementById('deleteMenu');
  
  // Check if we have any sent messages selected
  const hasSentMessages = Array.from(selectedMessages).some(msg => 
    msg.classList.contains('sent')
  );
  
  if (hasSentMessages) {
    document.getElementById('deleteForMe').style.display = 'flex';
    document.getElementById('deleteForEveryone').style.display = 'flex';
  } else {
    document.getElementById('deleteForMe').style.display = 'flex';
    document.getElementById('deleteForEveryone').style.display = 'none';
  }
  
  menu.classList.add('show');
}

function hideDeleteMenu() {
  document.getElementById('deleteMenu').classList.remove('show');
}

function clearSelection() {
  selectedMessages.forEach(msg => {
    msg.classList.remove('message-selected');
  });
  selectedMessages.clear();
  hideDeleteMenu();
}

function deleteMessages(forEveryone) {
  if (selectedMessages.size === 0) return;
  
  // Filter messages that can be deleted based on forEveryone flag
  const messagesToDelete = Array.from(selectedMessages).filter(msg => {
    return !forEveryone || msg.classList.contains('sent');
  });
  
  // Delete from DOM
  messagesToDelete.forEach(msg => msg.remove());
  
  // Delete from sentMessages array (if applicable)
  messagesToDelete.forEach(msg => {
    if (msg.classList.contains('sent')) {
      const messageId = msg.id.replace('msg-', '');
      sentMessages = sentMessages.filter(m => m.id.toString() !== messageId);
    }
  });
  
  clearSelection();
}


















    // Add dummy messages to demonstrate scrolling
    function addDummyMessages() {
      const messages = [
        {type: "received", text: "Hello there!", time: "10:30 AM"},
        {type: "received", text: "How are you doing today?", time: "10:31 AM"},
        {type: "sent", text: "I'm good, thanks! Here's a photo:", time: "10:32 AM"},
        {type: "sent", file: {name: "nature.jpg", type: "image/jpeg", size: 1024}, time: "10:32 AM"},
        {type: "received", text: "Nice photo! Here's a document you requested:", time: "10:33 AM"},
        {type: "received", file: {name: "document.pdf", type: "application/pdf", size: 2048}, time: "10:33 AM"},
        {type: "sent", text: "Thanks! Check out this video:", time: "10:34 AM"},
        {type: "sent", file: {name: "demo.mp4", type: "video/mp4", size: 4096}, time: "10:34 AM"},
        {type: "received", text: "Great video! Let me know if you need anything else.", time: "10:35 AM"}
      ];

      messages.forEach((msg, i) => {
        setTimeout(() => {
          if (msg.text) {
            const messageId = Date.now() + i;
            addTextMessage(msg.text, msg.type, messageId);
            if (msg.type === 'sent') {
              sentMessages.push({id: messageId, element: document.getElementById(`msg-${messageId}`)});
              // Simulate read receipt after a delay
              if (i >= 2) { // Only for some sent messages
                setTimeout(() => {
                  const doubleTick = document.querySelector(`#msg-${messageId} .double-tick`);
                  if (doubleTick) doubleTick.classList.add('read');
                }, 2000);
              }
            }
          } else if (msg.file) {
            // For demo purposes, we'll create a dummy file object
            const dummyFile = {
              name: msg.file.name,
              type: msg.file.type,
              size: msg.file.size,
              arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
            };
            const messageId = Date.now() + i;
            addFileMessage(dummyFile, msg.type, messageId);
            if (msg.type === 'sent') {
              sentMessages.push({id: messageId, element: document.getElementById(`msg-${messageId}`)});
              // Simulate read receipt after a delay
              if (i >= 2) { // Only for some sent messages
                setTimeout(() => {
                  const doubleTick = document.querySelector(`#msg-${messageId} .double-tick`);
                  if (doubleTick) doubleTick.classList.add('read');
                }, 2000);
              }
            }
          }
        }, i * 800);
      });
    }

    // Add online status indicator
    addOnlineStatus();

    // Setup message deletion
    setupMessageDeletion();

    // Add dummy messages for testing
    addDummyMessages();                  













