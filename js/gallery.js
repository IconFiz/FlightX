document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const viewBtn = document.getElementById('viewBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const viewSection = document.getElementById('viewSection');
    const uploadSection = document.getElementById('uploadSection');
    const uploadForm = document.getElementById('uploadForm');
    const uploadArea = document.getElementById('uploadArea');
    const photoUpload = document.getElementById('photoUpload');
    const galleryGrid = document.getElementById('galleryGrid');
    const modal = document.getElementById('photoModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalPhotographer = document.getElementById('modalPhotographer');
    const modalDescription = document.getElementById('modalDescription');
    const closeBtn = document.querySelector('.close-btn');

    // Sample gallery data (in a real app, this would come from a backend)
    let galleryData = JSON.parse(localStorage.getItem('galleryData')) || [];

    // Function to switch between view and upload sections
    function switchSection(section) {
        viewSection.classList.toggle('hidden', section !== 'view');
        uploadSection.classList.toggle('hidden', section !== 'upload');
        viewBtn.classList.toggle('active', section === 'view');
        uploadBtn.classList.toggle('active', section === 'upload');
    }

    // Function to render gallery items
    function renderGallery() {
        galleryGrid.innerHTML = '';
        galleryData.forEach((item, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.title}">
                <div class="gallery-item-info">
                    <h3>${item.title}</h3>
                    <p>By ${item.photographer}</p>
                </div>
            `;
            galleryItem.addEventListener('click', () => showPhotoModal(item));
            galleryGrid.appendChild(galleryItem);
        });
    }

    // Function to show photo in modal
    function showPhotoModal(photo) {
        modalImage.src = photo.imageUrl;
        modalTitle.textContent = photo.title;
        modalPhotographer.textContent = photo.photographer;
        modalDescription.textContent = photo.description || '';
        modal.classList.remove('hidden');
    }

    // Function to handle file upload
    function handleFileUpload(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
        });
    }

    // Event Listeners
    viewBtn.addEventListener('click', () => switchSection('view'));
    uploadBtn.addEventListener('click', () => switchSection('upload'));

    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--accent-color)';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'var(--text-secondary)';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--text-secondary)';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            photoUpload.files = e.dataTransfer.files;
        }
    });

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('photoTitle').value;
        const photographer = document.getElementById('photographer').value;
        const description = document.getElementById('photoDescription').value;
        const file = photoUpload.files[0];

        if (!file) {
            alert('Please select a photo to upload');
            return;
        }

        try {
            const imageUrl = await handleFileUpload(file);
            
            // Add new photo to gallery data
            galleryData.unshift({
                title,
                photographer,
                description,
                imageUrl,
                date: new Date().toISOString()
            });

            // Save to localStorage (in a real app, this would be saved to a backend)
            localStorage.setItem('galleryData', JSON.stringify(galleryData));

            // Reset form and switch to view section
            uploadForm.reset();
            switchSection('view');
            renderGallery();

            // Show success message
            alert('Photo uploaded successfully!');
        } catch (error) {
            console.error('Error uploading photo:', error);
            alert('Error uploading photo. Please try again.');
        }
    });

    // Initial render
    renderGallery();
}); 