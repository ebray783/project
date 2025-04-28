// Automatically toggle between src and data-alt for images
document.addEventListener("DOMContentLoaded", () => {
  const mintImages = document.querySelectorAll(".mint-item img");

  mintImages.forEach((img) => {
    let isSrcActive = true; // Track whether the main src is active
    const srcMain = img.src; // Store the original src
    const srcAlt = img.getAttribute("data-alt"); // Get the alternate image URL

    // Function to toggle images
    const toggleImage = () => {
      if (isSrcActive) {
        img.src = srcAlt; // Switch to data-alt
      } else {
        img.src = srcMain; // Switch back to original src
      }
      isSrcActive = !isSrcActive; // Toggle the state
    };

    // Set an interval to automatically toggle the image every 4 seconds
    setInterval(toggleImage, 4000);
  });
});