document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed");

    const header = document.querySelector('header'); // Add this line to define the header element
    const mainContent = document.getElementById('main-content');
    const numberOfRows = 50;
    const imagesPerRow = 9;
    const placeholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs='; // 1x1 pixel black placeholder image
    const imageSizeInKB = 60; // Approximate size of each image in KB

    // Floating counter
    const counter = document.getElementById('counter');
    let loadedImagesCount = 0;
    let lazyLoadActive = true;

    function updateCounter() {
        const memoryUsage = loadedImagesCount * imageSizeInKB;
        const lazyLoadStatus = lazyLoadActive ? 'ON' : 'OFF';
        counter.innerHTML = `Loaded Images: ${loadedImagesCount}<br>Memory Usage: ${memoryUsage} KB<br>Lazy Load: ${lazyLoadStatus}`;
        console.log(`Counter updated: Loaded Images: ${loadedImagesCount}, Memory Usage: ${memoryUsage} KB, Lazy Load: ${lazyLoadStatus}`);
    }

    // Floating Video Player
    const videoContainer = document.getElementById('video-container');
    const videoElement = document.getElementById('video');
    const closeButton = document.getElementById('close-video');

    let player;
    if (window.shaka) {
        shaka.polyfill.installAll();
        console.log("Shaka Player polyfills installed");
    } else {
        console.error("Shaka Player library is not available");
    }

    // Open video player
    function openVideoPlayer(videoUrl) {
        console.log(`Opening video player with URL: ${videoUrl}`);
        if (player) {
            console.log("Unloading existing player");
            player.unload(); // Unload any currently loaded video
        }
        if (!player) {
            console.log("Creating new Shaka Player instance");
            player = new shaka.Player(videoElement);
            player.addEventListener('error', onError);
        }
        videoContainer.style.display = 'flex';
        videoElement.autoplay = true;
        player.load(videoUrl).then(() => {
            console.log("Video loaded successfully");
            videoElement.play();  // Auto-play the video
        }).catch(onError);
    }

    // Close video player
    function closeVideoPlayer() {
        console.log("Closing video player");
        videoContainer.style.display = 'none';
        if (player) {
            player.unload(); // Unload the video to free up resources
            console.log("Unloading player and destroying instance");
            player = null; // Destroy the player instance
        }
    }

    closeButton.addEventListener('click', closeVideoPlayer);
    console.log("Close button event listener attached");

    function onError(event) {
        console.error('Shaka Player Error:', event.detail.code, event.detail.data);
    }

    // Function to create a row with random images
    function createRow(rowNumber) {
        console.log(`Creating row ${rowNumber}`);
        const section = document.createElement('section');
        section.classList.add('row');

        const title = document.createElement('h2');
        title.textContent = `Row ${rowNumber}`;
        section.appendChild(title);

        const postersDiv = document.createElement('div');
        postersDiv.classList.add('row__posters');

        for (let i = 1; i <= imagesPerRow; i++) {
            const img = document.createElement('img');
            img.classList.add('poster');
            img.setAttribute('data-src', `https://picsum.photos/200/300?random=${rowNumber * imagesPerRow + i}`);
            img.setAttribute('src', placeholder);
            img.alt = `Movie ${rowNumber * imagesPerRow + i}`;
            img.setAttribute('tabindex', '0'); // Make the image focusable

            img.addEventListener('load', () => {
                console.log(`Image loaded: ${img.src}`);
            });

            img.addEventListener('error', (event) => {
                console.error(`Error loading image: ${event.target.src}`);
            });

            postersDiv.appendChild(img);
        }

        section.appendChild(postersDiv);
        mainContent.appendChild(section);
        console.log(`Row ${rowNumber} created and added to main content`);
    }

    // Generate all rows
    for (let i = 1; i <= numberOfRows; i++) {
        createRow(i);
    }

    const lazyImages = document.querySelectorAll('img[data-src]');
    console.log(`Found ${lazyImages.length} images for lazy loading`);

    function loadVisibleImages() {
        console.log('Checking for images to load.');
        lazyImages.forEach(img => {
            const rect = img.getBoundingClientRect();
            if (rect.top >= 0 && rect.bottom <= window.innerHeight && lazyLoadActive) {
                if (!img.src || img.src === placeholder) {
                    img.src = img.getAttribute('data-src');
                    loadedImagesCount++;
                    console.log(`Image ${img.alt} loaded.`);
                    updateCounter();
                }
            }
        });
    }

    function unloadAllImages() {
        lazyImages.forEach(img => {
            if (img.src !== placeholder) {
                img.src = placeholder;
                loadedImagesCount--;
                console.log(`Image ${img.alt} unloaded.`);
                updateCounter();
            }
        });
    }

    function loadAllImages() {
        lazyImages.forEach(img => {
            if (img.src === placeholder) {
                img.src = img.getAttribute('data-src');
                loadedImagesCount++;
                console.log(`Image ${img.alt} loaded.`);
                updateCounter();
            }
        });
    }

    function stopLazyLoad() {
        lazyLoadActive = false;
        updateCounter();
    }

    function startLazyLoad() {
        lazyLoadActive = true;
        loadVisibleImages(); // Load visible images immediately after starting lazy load
        updateCounter();
    }

    window.addEventListener('scroll', loadVisibleImages);

    // Initial load of visible images
    loadVisibleImages();

    // Arrow key navigation and other key event handlers
    document.addEventListener('keydown', function (event) {
        const focusedElement = document.activeElement;
        console.log(`Key pressed: ${event.key}, Focused element: ${focusedElement.className}`);

        if (focusedElement.classList.contains('poster')) {
            let newFocusedElement;
            if (event.key === 'ArrowRight') {
                event.preventDefault();  // Prevent window scrolling
                newFocusedElement = focusedElement.nextElementSibling || focusedElement;
                console.log(`ArrowRight pressed, new focused element: ${newFocusedElement}`);
                newFocusedElement.focus();
                newFocusedElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            } else if (event.key === 'ArrowLeft') {
                event.preventDefault();  // Prevent window scrolling
                newFocusedElement = focusedElement.previousElementSibling || focusedElement;
                console.log(`ArrowLeft pressed, new focused element: ${newFocusedElement}`);
                newFocusedElement.focus();
                newFocusedElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            } else if (event.key === 'ArrowDown') {
                event.preventDefault();  // Prevent window scrolling
                const parentRow = focusedElement.parentElement;
                const nextRow = parentRow.parentElement.nextElementSibling;
                if (nextRow) {
                    const index = Array.from(parentRow.children).indexOf(focusedElement);
                    newFocusedElement = nextRow.querySelector('.row__posters').children[index] || nextRow.querySelector('.row__posters').firstElementChild;
                    console.log(`ArrowDown pressed, new focused element: ${newFocusedElement}`);
                    newFocusedElement.focus();
                    // Adjust scroll position considering the header height
                    mainContent.scrollBy(0, -header.offsetHeight);
                }
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();  // Prevent window scrolling
                const parentRow = focusedElement.parentElement;
                const previousRow = parentRow.parentElement.previousElementSibling;
                if (previousRow) {
                    const index = Array.from(parentRow.children).indexOf(focusedElement);
                    newFocusedElement = previousRow.querySelector('.row__posters').children[index] || previousRow.querySelector('.row__posters').lastElementChild;
                    console.log(`ArrowUp pressed, new focused element: ${newFocusedElement}`);
                    newFocusedElement.focus();
                    // Adjust scroll position considering the header height
                    mainContent.scrollBy(0, -header.offsetHeight);
                }
            } else if (event.key === 'Enter') {
                console.log(`Enter pressed, opening video player`);
                const videoUrl = `https://storage.googleapis.com/shaka-demo-assets/bbb-dark-truths/dash.mpd`; // Replace with the video URL
                openVideoPlayer(videoUrl);
            } else if (event.key === 'Escape') {
                console.log(`Escape pressed, closing video player`);
                closeVideoPlayer();
            }
        }

        if (event.key === '1') {
            console.log('Key 1 pressed, unloading all images');
            unloadAllImages();
        } else if (event.key === '2') {
            console.log('Key 2 pressed, loading all images');
            loadAllImages();
        } else if (event.key === '3') {
            console.log('Key 3 pressed, stopping lazy load');
            stopLazyLoad();
        } else if (event.key === '4') {
            console.log('Key 4 pressed, starting lazy load');
            startLazyLoad();
        }
    });

    // Auto-select the first item of the first row
    const firstPoster = document.querySelector('.row__posters .poster');
    if (firstPoster) {
        firstPoster.focus();
        console.log('Auto-selected the first poster');
    }
});
