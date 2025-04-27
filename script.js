// When DOM content is loaded, initialize the application
document.addEventListener('DOMContentLoaded', function() {    // Variables for DOM elements
    const menuIcon = document.getElementById('menu-icon');
    const sidebar = document.getElementById('sidebar');
    const videosContainer = document.getElementById('videos-container');
    const modal = document.getElementById('video-player-modal');
    const closeBtn = document.querySelector('.close');
    const videoPlayer = document.getElementById('video-player');
    const videoLoading = document.getElementById('video-loading');
    const videoTitle = document.getElementById('video-title');
    const channelName = document.getElementById('channel-name');
    const videoViews = document.getElementById('video-views');
    const videoDescription = document.getElementById('video-description-text');
    const categoryButtons = document.querySelectorAll('.category-button');
    const themeToggle = document.getElementById('theme-toggle');
    
    // Watch Later functionality
    let watchLaterList = [];
    
    // Load watch later list from localStorage
    try {
        const savedWatchLater = localStorage.getItem('youtubeCloneWatchLater');
        if (savedWatchLater) {
            watchLaterList = JSON.parse(savedWatchLater);
        }
    } catch (e) {
        console.error('Error loading watch later list:', e);
    }
    
    // Function to add a video to Watch Later
    function addToWatchLater(videoData) {
        // Check if the video is already in the list
        if (!watchLaterList.some(video => video.filename === videoData.filename)) {
            watchLaterList.push(videoData);
            localStorage.setItem('youtubeCloneWatchLater', JSON.stringify(watchLaterList));
            
            // Show a success message
            showNotification('Added to Watch Later');
            
            // Update sidebar count if needed
            updateWatchLaterCount();
        }
    }
    
    // Function to remove a video from Watch Later
    function removeFromWatchLater(filename) {
        const initialLength = watchLaterList.length;
        watchLaterList = watchLaterList.filter(video => video.filename !== filename);
        
        if (watchLaterList.length !== initialLength) {
            localStorage.setItem('youtubeCloneWatchLater', JSON.stringify(watchLaterList));
            showNotification('Removed from Watch Later');
            updateWatchLaterCount();
        }
    }
    
    // Function to show "Watch Later" videos
    function showWatchLaterVideos() {
        if (watchLaterList.length > 0) {
            displayVideos(watchLaterList);
        } else {
            // Show "no videos" message
            videosContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-clock" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                    <h2>No videos in Watch Later</h2>
                    <p>Videos added to Watch Later will appear here</p>
                </div>
            `;
        }
    }
    
    // Function to update Watch Later count in sidebar
    function updateWatchLaterCount() {
        const watchLaterItem = document.querySelector('.sidebar-item[data-section="watch-later"]');
        if (watchLaterItem) {
            const countSpan = watchLaterItem.querySelector('.count');
            if (countSpan) {
                countSpan.textContent = watchLaterList.length;
            }
        }
    }
    
    // Add a notification system
    function showNotification(message) {
        // Create notification element if it doesn't exist
        let notificationElement = document.getElementById('notification');
        if (!notificationElement) {
            notificationElement = document.createElement('div');
            notificationElement.id = 'notification';
            document.body.appendChild(notificationElement);
        }
        
        // Set message and show notification
        notificationElement.textContent = message;
        notificationElement.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            notificationElement.classList.remove('show');
        }, 3000);
    }
    
    // Theme management
    function loadThemePreference() {
        const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
        if (darkModeEnabled) {
            document.body.classList.add('dark-mode');
            themeToggle.classList.remove('fa-moon');
            themeToggle.classList.add('fa-sun');
        } else {
            document.body.classList.remove('dark-mode');
            themeToggle.classList.remove('fa-sun');
            themeToggle.classList.add('fa-moon');
        }
    }
    
    // Toggle theme on click
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const isDarkMode = document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', isDarkMode);
            
            // Toggle icon
            this.classList.toggle('fa-moon');
            this.classList.toggle('fa-sun');
        });
        
        // Load theme preference from localStorage
        loadThemePreference();
    }
    
    // Custom titles storage
    let customTitles = {};
    try {
        const savedTitles = localStorage.getItem('youtubeCloneCustomTitles');
        if (savedTitles) {
            customTitles = JSON.parse(savedTitles);
        }
    } catch (e) {
        console.error('Error loading saved titles:', e);
    }

    // Toggle sidebar on menu icon click
    menuIcon.addEventListener('click', function() {
        sidebar.classList.toggle('show');
    });

    // Close modal when clicking the close button
    closeBtn.addEventListener('click', function() {
        closeVideoPlayer();
    });

    // Close modal when clicking outside the modal content
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeVideoPlayer();
        }
    });    // Handle category button clicks
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter videos by category (in a real app)
            const category = this.textContent;
            console.log(`Filtering by category: ${category}`);
            
            // Clear search input when changing categories
            document.getElementById('search-input').value = '';
            
            // If category is not "All", filter videos
            if (category !== 'All') {
                filterVideosByCategory(category);
            } else {
                // If "All" is selected, reload all videos
                loadVideos();
            }
        });
    });
    
    // Add search functionality
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent form submission
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (searchTerm) {
            // Search videos by title, channel name, or description
            searchVideos(searchTerm);
        } else {
            // If search is empty, load all videos
            loadVideos();
        }
    });// Function to load videos from the file system
    function loadVideos() {
        // Load from videos.json which contains metadata about our videos
        fetch('videos.json')
            .then(response => response.json())
            .then(videos => {
                // Process the videos to ensure they have correct paths
                const processedVideos = videos.map(video => {                    // Check if the video exists in your system
                    // In a real app, this would be handled server-side
                    return {
                        ...video,
                        // Use the video filename as is, since it's in the same folder
                        thumbnail: video.thumbnail || "thumbnails/default-thumbnail.jpg"
                    };
                });
                
                displayVideos(processedVideos);
            })
            .catch(error => {
                console.error('Error loading videos:', error);
                // If videos.json doesn't exist, create default videos from file system
                createDefaultVideos();
            });
    }

    // Function to create default videos from file system
    function createDefaultVideos() {
        // Static list of videos based on the files in the workspace
        const videos = [
            {
                title: "Fashion - Marin Kitagawa | My Dress Up Darling",
                filename: "Fashion 👗 - Marin Kitagawa ｜ My Dress Up Darling [Edit⧸AMV] [2p792eIKAOw].mp4",
                channelName: "Anime World",
                views: "1.2M",
                uploadDate: "2 months ago",
                duration: "3:24",
                thumbnail: "thumbnails/marin-kitagawa.jpg",
                description: "Music: Fashion by The Royal Concept\nAnime: My Dress-Up Darling (Sono Bisque Doll wa Koi wo Suru)"
            },
            {
                title: "MERE NAAM TU | Multianime AMV/EDIT",
                filename: "Multianime - ＂ MERE NAAM TU ＂ [AMV⧸EDIT] ALIGHT MOTION [TM4G7d9uoPM].mp4",
                channelName: "AMV Studio",
                views: "956K",
                uploadDate: "3 weeks ago",
                duration: "4:15",
                thumbnail: "thumbnails/multianime.jpg",
                description: "Music: Mere Naam Tu from Zero\nA compilation of various anime scenes edited together with Alight Motion"
            },
            {
                title: "Aesthetic Anime Edit",
                filename: "Video by _asyouwish_.07 [DIGe3TozNE3].mp4",
                channelName: "_asyouwish_.07",
                views: "452K",
                uploadDate: "1 month ago",
                duration: "0:59",
                thumbnail: "thumbnails/aesthetic.jpg",
                description: "An aesthetic anime edit with beautiful visuals and transitions"
            },
            {
                title: "Special VFX Edit by kaizenmv",
                filename: "Video by kaizenmv [DIO5QxjvJVF].mp4",
                channelName: "kaizenmv",
                views: "1.8M",
                uploadDate: "2 months ago",
                duration: "1:15",
                thumbnail: "thumbnails/kaizenmv.jpg",
                description: "Special visual effects edit featuring stunning transitions and color grading"
            },
            {
                title: "3D Animation by koyukii_3d",
                filename: "Video by koyukii_3d [DIagIQ-S1mi].mp4",
                channelName: "koyukii_3d",
                views: "2.3M",
                uploadDate: "3 months ago",
                duration: "2:47",
                thumbnail: "thumbnails/3d-animation.jpg",
                description: "Amazing 3D animation with incredible detail and beautiful lighting effects"
            }
        ];
        
        displayVideos(videos);
    }    // Function to display videos in the container
    function displayVideos(videos) {
        videosContainer.innerHTML = '';
        
        videos.forEach(video => {
            // Check if there's a custom title for this video
            const displayTitle = customTitles[video.filename] || video.title;
            
            const videoCard = document.createElement('div');
            videoCard.className = 'video-card';
            videoCard.setAttribute('data-filename', video.filename);
            videoCard.setAttribute('data-title', displayTitle);
            videoCard.setAttribute('data-channel', video.channelName);
            videoCard.setAttribute('data-description', video.description);            // Create HTML structure for video card
            videoCard.innerHTML = `
                <div class="video-thumbnail">
                    <div class="thumbnail-placeholder" style="background-color: #1e1e1e; width: 100%; height: 100%;">
                        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white;">
                            <i class="fas fa-play" style="font-size: 48px; opacity: 0.8;"></i>
                        </div>
                    </div>
                    <span class="video-duration">${video.duration}</span>
                </div>
                <div class="video-info">
                    <div class="channel-avatar">${video.channelName.charAt(0)}</div>
                    <div class="video-details">
                        <h3 class="video-title">${displayTitle}</h3>
                        <p class="channel-name">${video.channelName}</p>
                        <p class="video-metadata">${video.views} views • ${video.uploadDate}</p>
                    </div>
                </div>
            `;
              // Generate thumbnail if not already available
            const thumbnailElement = videoCard.querySelector('.video-thumbnail');
            const placeholder = thumbnailElement.querySelector('.thumbnail-placeholder');
            
            // Try to create a thumbnail for this video
            const tempVideo = document.createElement('video');
            tempVideo.src = video.filename;
            tempVideo.muted = true;
            tempVideo.style.display = 'none';
            
            tempVideo.onloadedmetadata = function() {
                // We just check if we can load the video metadata
                generateThumbnailFromVideo(tempVideo, video.filename)
                    .then(thumbnailUrl => {
                        // Create an image element for the thumbnail
                        const thumbnailImg = document.createElement('img');
                        thumbnailImg.src = thumbnailUrl;
                        thumbnailImg.alt = "Video thumbnail";
                        thumbnailImg.className = "video-thumbnail-img";
                        
                        // Hide placeholder and append thumbnail
                        placeholder.style.display = 'none';
                        thumbnailElement.insertBefore(thumbnailImg, placeholder);
                    })
                    .catch(err => {
                        console.error("Could not generate thumbnail:", err);
                        // Keep placeholder visible
                    });
            };
            
            tempVideo.onerror = function() {
                // If we can't load the video, just keep the placeholder
            };
            
            // Add hover preview for video thumbnails
            let previewVideo = null;
            
            thumbnailElement.addEventListener('mouseenter', function() {
                if (window.innerWidth >= 768) { // Only on desktop/tablets
                    // Create preview video element
                    previewVideo = document.createElement('video');
                    previewVideo.src = video.filename;
                    previewVideo.muted = true; // Mute the preview
                    previewVideo.loop = true; // Loop the preview
                    previewVideo.className = 'preview-video';
                    
                    // Start from a random position in the video
                    const randomStartTime = Math.floor(Math.random() * 30); // Random time between 0-30 seconds
                    previewVideo.currentTime = randomStartTime;
                    
                    // Replace thumbnail with video preview
                    placeholder.style.display = 'none';
                    
                    // Hide thumbnail image if it exists
                    const thumbnailImg = this.querySelector('.video-thumbnail-img');
                    if (thumbnailImg) {
                        thumbnailImg.style.display = 'none';
                    }
                    
                    this.appendChild(previewVideo);
                    
                    // Play the preview with a small delay
                    setTimeout(() => {
                        previewVideo.play().catch(e => console.log('Preview autoplay prevented:', e));
                    }, 300);
                }
            });
              thumbnailElement.addEventListener('mouseleave', function() {
                if (previewVideo) {
                    previewVideo.pause();
                    previewVideo.remove();
                    previewVideo = null;
                    
                    // Show thumbnail image if available, otherwise show placeholder
                    const thumbnailImg = this.querySelector('.video-thumbnail-img');
                    if (thumbnailImg) {
                        thumbnailImg.style.display = 'block';
                    } else {
                        const placeholder = this.querySelector('.thumbnail-placeholder');
                        placeholder.style.display = 'block';
                    }
                }
            });
            
            // Add click event to play the video
            videoCard.addEventListener('click', function() {
                playVideo(this.getAttribute('data-filename'), 
                           this.getAttribute('data-title'),
                           this.getAttribute('data-channel'),
                           this.getAttribute('data-description'));
            });
            
            videosContainer.appendChild(videoCard);
        });
    }    // Function to play a video in the modal
    function playVideo(filename, title, channel, description) {
        // Show loading spinner
        if (videoLoading) {
            videoLoading.style.display = 'block';
        }
        
        // Set video source
        videoPlayer.src = filename;
        
        // Add event listeners for video
        videoPlayer.oncanplay = function() {
            // Hide loading spinner when video can play
            if (videoLoading) {
                videoLoading.style.display = 'none';
            }
        };
        
        videoPlayer.onerror = function(e) {
            console.error('Video error:', e);
            // Hide loading spinner and show error message
            if (videoLoading) {
                videoLoading.innerHTML = '<p>Error loading video. Please try again.</p>';
            }
        };
          // Check if there's a custom title saved for this video
        const customTitle = customTitles[filename] || title;
        
        // Set video info
        videoTitle.textContent = customTitle;
        
        // Setup Save to Watch Later button
        const saveButton = document.getElementById('save-button');
        if (saveButton) {
            // Check if the video is already in Watch Later
            const isInWatchLater = watchLaterList.some(video => video.filename === filename);
            
            if (isInWatchLater) {
                saveButton.innerHTML = '<i class="fas fa-check"></i> <span>Saved</span>';
                saveButton.classList.add('saved');
            } else {
                saveButton.innerHTML = '<i class="fas fa-clock"></i> <span>Watch Later</span>';
                saveButton.classList.remove('saved');
            }
            
            // Add click event
            saveButton.onclick = function() {
                const isNowInWatchLater = watchLaterList.some(video => video.filename === filename);
                
                if (isNowInWatchLater) {
                    // Remove from Watch Later
                    removeFromWatchLater(filename);
                    saveButton.innerHTML = '<i class="fas fa-clock"></i> <span>Watch Later</span>';
                    saveButton.classList.remove('saved');
                } else {
                    // Add to Watch Later
                    const videoData = {
                        filename: filename,
                        title: customTitle,
                        channelName: channel,
                        description: description,
                        // Add some default values
                        views: `${Math.floor(Math.random() * 500) + 100}K`,
                        uploadDate: '1 week ago',
                        duration: '3:45'
                    };
                    
                    addToWatchLater(videoData);
                    saveButton.innerHTML = '<i class="fas fa-check"></i> <span>Saved</span>';
                    saveButton.classList.add('saved');
                }
            };
        }
        
        // Make the title editable - this allows the user to change the title as requested
        videoTitle.contentEditable = true;
        
        // Remove previous event listeners (to avoid duplicates)
        videoTitle.removeEventListener('blur', handleTitleEdit);
        videoTitle.addEventListener('blur', handleTitleEdit);
        
        // Function to handle title editing
        function handleTitleEdit() {
            const newTitle = videoTitle.textContent;
            if (newTitle && newTitle.trim() !== '') {
                // Save the custom title
                customTitles[filename] = newTitle;
                localStorage.setItem('youtubeCloneCustomTitles', JSON.stringify(customTitles));
                
                // Update the UI
                const videoCards = document.querySelectorAll('.video-card');
                videoCards.forEach(card => {
                    if (card.getAttribute('data-filename') === filename) {
                        card.setAttribute('data-title', newTitle);
                        card.querySelector('.video-title').textContent = newTitle;
                    }
                });
            }
        }
        
        channelName.textContent = channel;
        videoViews.textContent = `${Math.floor(Math.random() * 500) + 100} views • ${getCurrentDate()}`;
        videoDescription.textContent = description || "No description available";
        
        // Show modal
        modal.style.display = 'block';
        
        // Play video
        videoPlayer.load();
        videoPlayer.play().catch(e => console.log('Autoplay prevented by browser policy:', e));
    }    // Function to close the video player
    function closeVideoPlayer() {
        // Pause the video
        videoPlayer.pause();
        videoPlayer.src = '';
        
        // Reset loading spinner
        if (videoLoading) {
            videoLoading.style.display = 'block';
            videoLoading.innerHTML = '<div class="spinner"></div><p>Loading video...</p>';
        }
        
        // Hide modal
        modal.style.display = 'none';
    }

    // Fullscreen button functionality
    const fullscreenButton = document.getElementById('fullscreen-btn');
    if (fullscreenButton) {
        fullscreenButton.addEventListener('click', function() {
            toggleFullScreen();
        });
    }
    
    // Function to toggle fullscreen
    function toggleFullScreen() {
        const container = document.querySelector('.video-player-container');
        
        if (!document.fullscreenElement) {
            // Enter fullscreen
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.mozRequestFullScreen) { // Firefox
                container.mozRequestFullScreen();
            } else if (container.webkitRequestFullscreen) { // Chrome, Safari & Opera
                container.webkitRequestFullscreen();
            } else if (container.msRequestFullscreen) { // IE/Edge
                container.msRequestFullscreen();
            }
            
            // Change icon to exit fullscreen
            if (fullscreenButton) {
                fullscreenButton.innerHTML = '<i class="fas fa-compress"></i>';
            }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) { // Firefox
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) { // Chrome, Safari & Opera
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { // IE/Edge
                document.msExitFullscreen();
            }
            
            // Change icon back to enter fullscreen
            if (fullscreenButton) {
                fullscreenButton.innerHTML = '<i class="fas fa-expand"></i>';
            }
        }
    }
    
    // Listen for fullscreen change events
    document.addEventListener('fullscreenchange', updateFullscreenButton);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
    document.addEventListener('mozfullscreenchange', updateFullscreenButton);
    document.addEventListener('MSFullscreenChange', updateFullscreenButton);
    
    function updateFullscreenButton() {
        if (document.fullscreenElement || 
            document.webkitFullscreenElement || 
            document.mozFullScreenElement ||
            document.msFullscreenElement) {
            // In fullscreen mode
            if (fullscreenButton) {
                fullscreenButton.innerHTML = '<i class="fas fa-compress"></i>';
            }
        } else {
            // Not in fullscreen mode
            if (fullscreenButton) {
                fullscreenButton.innerHTML = '<i class="fas fa-expand"></i>';
            }
        }
    }

    // Get current date formatted
    function getCurrentDate() {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return now.toLocaleDateString('en-US', options);
    }

    // Load videos when the page loads
    loadVideos();

    // Handle keyboard events (e.g., ESC to close modal)
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            closeVideoPlayer();
        }
    });

    // Handle window resize to adjust layout
    window.addEventListener('resize', function() {
        // Close sidebar on small screens when window is resized
        if (window.innerWidth <= 768 && sidebar.classList.contains('show')) {
            sidebar.classList.remove('show');
        }
    });

    // Create a thumbnails directory if it doesn't exist
    function ensureThumbnailsDirectory() {
        // In a real application, this would create a directory on the server
        console.log("Thumbnails directory would be created here in a real server environment");
    }    // Initialize the app
    ensureThumbnailsDirectory();
    
    // Global variable to store all videos
    let allVideos = [];
    
    // Add click events to sidebar items
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            sidebarItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
            
            // Handle different sidebar sections
            const section = this.getAttribute('data-section');
            if (section === 'watch-later') {
                showWatchLaterVideos();
            } else if (section === 'home') {
                loadVideos(); // Show all videos
            }
            
            // On mobile, close sidebar after selection
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('show');
            }
        });
    });
    
    // Update Watch Later count
    updateWatchLaterCount();
    
    // Function to search videos
    function searchVideos(searchTerm) {
        if (!allVideos.length) return;
        
        const filteredVideos = allVideos.filter(video => {
            const title = customTitles[video.filename] || video.title;
            return title.toLowerCase().includes(searchTerm) ||
                   video.channelName.toLowerCase().includes(searchTerm) ||
                   (video.description && video.description.toLowerCase().includes(searchTerm));
        });
        
        if (filteredVideos.length) {
            displayVideos(filteredVideos);
        } else {
            // Show "no results" message
            videosContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                    <h2>No results found</h2>
                    <p>Try different keywords or check spelling</p>
                </div>
            `;
        }
    }
    
    // Function to filter videos by category
    function filterVideosByCategory(category) {
        if (!allVideos.length) return;
        
        // Map categories to keywords
        const categoryKeywords = {
            'Anime': ['anime', 'marin', 'dress', 'amv'],
            'Music': ['music', 'naam', 'song', '12am_songs'],
            'Edits': ['edit', 'aesthetic', 'shukur', 'midnight'],
            'AMVs': ['amv', 'ameno.amv', 'tomioamv', 'foryouamv'],
            'VFX': ['vfx', 'effect', 'emiya.vfx', 'zekrox.fx_', 'newworld_vfx'],
            '3D': ['3d', 'animation', 'koyukii_3d']
        };
        
        // Get keywords for selected category
        const keywords = categoryKeywords[category] || [];
        
        const filteredVideos = allVideos.filter(video => {
            const title = customTitles[video.filename] || video.title;
            
            // Check if video matches any keyword in the category
            return keywords.some(keyword => 
                title.toLowerCase().includes(keyword) ||
                video.channelName.toLowerCase().includes(keyword) ||
                (video.description && video.description.toLowerCase().includes(keyword)) ||
                video.filename.toLowerCase().includes(keyword)
            );
        });
        
        if (filteredVideos.length) {
            displayVideos(filteredVideos);
        } else {
            // Show "no videos in category" message
            videosContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-filter" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                    <h2>No videos in ${category}</h2>
                    <p>Try another category</p>
                </div>
            `;
        }
    }
    
    // Override loadVideos function to store videos globally
    const originalLoadVideos = loadVideos;
    loadVideos = function() {
        fetch('videos.json')
            .then(response => response.json())
            .then(videos => {
                // Process the videos to ensure they have correct paths
                const processedVideos = videos.map(video => {
                    return {
                        ...video,
                        thumbnail: video.thumbnail || "thumbnails/default-thumbnail.jpg"
                    };
                });
                
                // Store all videos globally
                allVideos = processedVideos;
                
                displayVideos(processedVideos);
            })
            .catch(error => {
                console.error('Error loading videos:', error);
                createDefaultVideos();
            });
    };
    
    // Function to create a thumbnail from a video
    function generateThumbnailFromVideo(videoElement, videoFile) {
        return new Promise((resolve, reject) => {
            // Create a temporary video element
            const tempVideo = document.createElement('video');
            tempVideo.src = videoFile;
            tempVideo.crossOrigin = 'anonymous';
            tempVideo.style.display = 'none';
            document.body.appendChild(tempVideo);
            
            // Once the video metadata is loaded, capture a frame
            tempVideo.onloadedmetadata = function() {
                // Seek to the middle of the video
                tempVideo.currentTime = tempVideo.duration / 3;
            };
            
            // Once we've seeked to the right time, capture the frame
            tempVideo.onseeked = function() {
                // Create canvas and draw the video frame
                const canvas = document.createElement('canvas');
                canvas.width = tempVideo.videoWidth;
                canvas.height = tempVideo.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
                
                // Convert canvas to image URL (data URL)
                try {
                    const thumbnailUrl = canvas.toDataURL('image/jpeg');
                    
                    // Clean up
                    document.body.removeChild(tempVideo);
                    
                    // Resolve with the thumbnail URL
                    resolve(thumbnailUrl);
                } catch (e) {
                    console.error('Error generating thumbnail:', e);
                    reject(e);
                    document.body.removeChild(tempVideo);
                }
            };
            
            // Handle errors
            tempVideo.onerror = function(e) {
                console.error('Error loading video for thumbnail:', e);
                document.body.removeChild(tempVideo);
                reject(e);
            };
            
            // Load the video
            tempVideo.load();
        });
    }
});
