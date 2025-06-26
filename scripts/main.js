document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll("nav ul li a");
  const hamburger = document.querySelector(".hamburger");
  const nav = document.querySelector("nav");

  let lastKnownScrollY = window.scrollY;
  let ticking = false;
  let scrollPosition = 0;

  // Firebase Configuration
  const firebaseConfig = {
    apiKey: "AIzaSyD4d93ABAaV4dikgtjLmz7k4Vx6-JUChGs",
    authDomain: "nif4erasmus-3fb80.firebaseapp.com",
    projectId: "nif4erasmus-3fb80",
    storageBucket: "nif4erasmus-3fb80.firebasestorage.app",
    messagingSenderId: "53708558332",
    appId: "1:53708558332:web:fbf84088da99ffdfacec79",
    measurementId: "G-5GFPK7SM1T",
  };
  const STRIPE_PAYMENT_LINKS = {
    nifOnly: "https://buy.stripe.com/test_aFa7sKeHj27zcUr5c38k800",
    nifAndTax: "https://buy.stripe.com/test_dRm3cubv79A18EbeMD8k801",
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  const storage = firebase.storage();

  // Initialize EmailJS
  (function () {
    emailjs.init("B_OgUkgT3w8lysw_g");
  })();

  // Update the uploadFile function to use the storage reference
  async function uploadFile(file, path) {
    try {
      // Add metadata to track uploads
      const metadata = {
        customMetadata: {
          uploadTime: new Date().toISOString(),
          fileType: file.type,
        },
      };

      const storageRef = storage.ref(path);
      const snapshot = await storageRef.put(file, metadata);
      //const metadataResult = await snapshot.ref.getMetadata();
      //console.log("File uploaded successfully:", metadataResult);
      return true; //"https://console.firebase.google.com/u/0/project/nif4erasmus-3fb80/storage/"+metadataResult.bucket+"/files//"+metadataResult.fullPath;
      //return await snapshot.ref.getDownloadURL();
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  }

  // Function to update the active link based on the current URL or hash
  function updateActiveLink() {
    const currentPath = window.location.pathname; // Get the current page path
    const currentHash = window.location.hash; // Get the current hash (e.g., #services)

    navLinks.forEach((link) => {
      const linkPath = link.getAttribute("href");

      // Check if the link matches the current path or hash
      if (
        currentPath.includes(linkPath) || // Match for page links
        (linkPath.startsWith("#") && linkPath === currentHash) // Match for hash links
      ) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }
  // Add this at the start
  function updateScrollPadding() {
    const header = document.querySelector("header");
    const headerHeight = header.offsetHeight;
    const topMargin = 20; // The header's top margin
    const totalOffset = headerHeight + topMargin + 20; // Adding extra 20px for spacing

    document.documentElement.style.setProperty(
      "--scroll-padding",
      `${totalOffset}px`
    );
  }

  // Run on load
  updateScrollPadding();

  // Run on resize
  window.addEventListener("resize", updateScrollPadding);
  // ✅ Scroll event handler (optimized)
  function onScroll() {
    lastKnownScrollY = window.scrollY;

    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActiveLink();
        ticking = false;
      });

      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll);
  updateActiveLink(); // On load

  // Update active link on hash change (for in-page navigation)
  window.addEventListener("hashchange", updateActiveLink);

  // ✅ Smooth scroll fallback for older browsers (optional)
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      const target = document.querySelector(targetId);

      if (target) {
        // Optional: fallback if smooth behavior not supported
        if (!("scrollBehavior" in document.documentElement.style)) {
          e.preventDefault();
          window.scrollTo({
            top: target.offsetTop - 140, // Adjust if needed
            behavior: "smooth",
          });
        }

        // Immediate active class (optional)
        navLinks.forEach((l) => l.classList.remove("active"));
        this.classList.add("active");
      }
    });
  });

  function lockScroll() {
    // Store current scroll position
    scrollPosition = window.pageYOffset;
    // Add styles to lock the body
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollPosition}px`;
    body.style.width = "100%";
  }

  function unlockScroll() {
    // Remove scroll lock styles
    body.style.removeProperty("overflow");
    body.style.removeProperty("position");
    body.style.removeProperty("top");
    body.style.removeProperty("width");
    // Restore scroll position
    window.scrollTo(0, scrollPosition);
  }

  hamburger.addEventListener("click", function () {
    hamburger.classList.toggle("active");
    nav.classList.toggle("active");
    body.classList.toggle("no-scroll");

    if (nav.classList.contains("active")) {
      lockScroll();
    } else {
      unlockScroll();
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      hamburger.classList.remove("active");
      nav.classList.remove("active");
      document.body.classList.remove("no-scroll");
      unlockScroll();
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", function (event) {
    if (
      !hamburger.contains(event.target) &&
      !nav.contains(event.target) &&
      nav.classList.contains("active")
    ) {
      hamburger.classList.remove("active");
      nav.classList.remove("active");
      document.body.classList.remove("no-scroll");
      unlockScroll();
    }
  });

  // FAQ Toggle functionality
  document.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
      const answer = button.nextElementSibling;
      const isOpen = answer.classList.contains("open");

      // Close all answers first
      document.querySelectorAll(".faq-answer").forEach((a) => {
        a.classList.remove("open");
      });
      document.querySelectorAll(".faq-question").forEach((q) => {
        q.classList.remove("active");
      });

      // Toggle current answer if it wasn't open
      if (!isOpen) {
        answer.classList.add("open");
        button.classList.add("active");
      }
    });
  });

  // Form submission handler
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      // Verify reCAPTCHA
      const recaptchaResponse = grecaptcha.getResponse();
      if (!recaptchaResponse) {
        document.getElementById("form-status").textContent =
          "Please verify that you are not a robot.";
        document.getElementById("form-status").className = "form-status error";
        return;
      }

      // Get form data
      const formData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        message: document.getElementById("message").value,
        submitTime: new Date().toLocaleString(),
      };

      // Show loading status
      document.getElementById("form-status").textContent = "Sending...";
      document.getElementById("form-status").className = "form-status sending";

      // Send email using EmailJS
      // Replace with your service ID and template ID
      emailjs.send("service_4ekh8ho", "template_00yzatn", formData).then(
        function (response) {
          document.getElementById("form-status").textContent =
            "Message sent successfully!";
          document.getElementById("form-status").className =
            "form-status success";
          contactForm.reset();
          grecaptcha.reset();
        },
        function (error) {
          document.getElementById("form-status").textContent =
            "Failed to send message. Please try again.";
          document.getElementById("form-status").className =
            "form-status error";
          console.error("EmailJS error:", error);
        }
      );
    });
  }

  // Personal Info form handler
  // Form navigation handling
  const form = document.getElementById("personalInfoForm");
  if (form) {
    const sections = form.querySelectorAll(".form-section");
    const progressSteps = form.querySelectorAll(".progress-step");
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const submitBtn = this.querySelector(".submit-btn");
      const whatsappInput = this.querySelector("#whatsapp");

      submitBtn.innerHTML = 'Redirecting<span class="dot-anim"></span>';
      submitBtn.disabled = true;

      // Validate WhatsApp number
      if (!whatsappInput.value) {
        alert("Please enter your WhatsApp number");
        whatsappInput.focus();
        submitBtn.textContent = "Proceed to Payment";
        submitBtn.disabled = false;
        return;
      }

      try {
        const formData = new FormData(this);

        // Upload files first
        const idCard = formData.get("idCard");
        const proofOfAddress = formData.get("proofOfAddress");

        await uploadFile(
          idCard,
          `documents/${formData.get("email")}/id-card-${Date.now()}`
        );

        await uploadFile(
          proofOfAddress,
          `documents/${formData.get("email")}/proof-address-${Date.now()}`
        );
        const email = formData.get("email");
        const firebaseConsoleUrl =
          "https://console.firebase.google.com/u/0/project/nif4erasmus-3fb80/storage/nif4erasmus-3fb80.firebasestorage.app/files/~2Fdocuments~2F" +
          email;

        const formDataObject = {
          personalDetails: {
            fullName: formData.get("fullName"),
            dateOfBirth: formData.get("dateOfBirth"),
            nationality: formData.get("nationality"),
            idCard: firebaseConsoleUrl,
          },
          addressInformation: {
            address: formData.get("address"),
            zipCode: formData.get("zipCode"),
            city: formData.get("city"),
            country: formData.get("country"),
            proofOfAddress: firebaseConsoleUrl,
          },
          contactInformation: {
            email: email,
            whatsapp: whatsappInput.value,
          },
          serviceDetails: {
            type: formData.get("service"),
            price:
              formData.get("service") === "nifOnly" ? "50,00 €" : "100,00 €",
            description:
              formData.get("service") === "nifOnly"
                ? "NIF (EU/EEA CITIZENS)"
                : "NIF and TAX REPRESENTATION (NON UE/EEA CITIZEN)",

            selectedService: formData.get("service"), // Add this explicit field
          },
          referralInfo: {
            source: Array.from(
              document.querySelectorAll(
                'input[name="referralSource[]"]:checked'
              )
            )
              .map((checkbox) => {
                if (checkbox.id === "other") {
                  const otherText =
                    document.getElementById("otherSource").value;
                  return otherText ? `Other: ${otherText}` : null;
                }
                return checkbox.value;
              })
              .filter(
                (value) => value !== null && value !== undefined && value !== ""
              )
              .join(", "),
          },
          submitTime: new Date().toLocaleString(),
        };

        // Store form data in sessionStorage
        sessionStorage.setItem(
          "formSubmission",
          JSON.stringify(formDataObject)
        );
        console.log("Form data object:", formDataObject);
        // Send email with download URLs

        // Get the selected service
        const selectedService = formData.get("service");
        const paymentLink = STRIPE_PAYMENT_LINKS[selectedService];

        if (!paymentLink) {
          throw new Error("Invalid service selection");
        }

        // 3. Create the success URL with parameters
        console.log("Selected service:", selectedService);
        console.log("Payment link:", paymentLink);
        console.log(window.location.origin);
        const successUrl = new URL(`${window.location.origin}/success.html`);
        console.log("Success URL:", successUrl);
        successUrl.searchParams.append("payment_status", "success");
        successUrl.searchParams.append("service", selectedService);
        // 5. Redirect to Stripe payment with success URL
        const stripeUrl = new URL(paymentLink);
        console.log("Stripe URL:", stripeUrl);
        stripeUrl.searchParams.append("success_url", successUrl.toString());
        // Redirect to Stripe payment link
        // 6. Redirect to payment
        console.log(
          "Redirecting to Stripe payment link:",
          stripeUrl.toString()
        );
        window.location.href = stripeUrl.toString();
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
        submitBtn.textContent = "Proceed to Payment";
        submitBtn.disabled = false;
      }
    });

    // Next button handler
    form.querySelectorAll(".next-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const currentSection = button.closest(".form-section");
        const currentStep = parseInt(currentSection.dataset.step);

        // Special validation for service selection (Step 1)
        if (currentStep === 1) {
          const serviceInputs = currentSection.querySelectorAll(
            'input[name="service"]'
          );
          let serviceSelected = false;

          serviceInputs.forEach((input) => {
            if (input.checked) {
              serviceSelected = true;
            }
          });
          // Check consent checkboxes
          const termsCheckbox = currentSection.querySelector("#acceptTerms");
          const privacyCheckbox =
            currentSection.querySelector("#acceptPrivacy");
          if (!termsCheckbox.checked || !privacyCheckbox.checked) {
            alert(
              "Please accept the Terms and Conditions and the Privacy Policy before proceeding."
            );
            return;
          }

          if (!serviceSelected) {
            alert("Please select a service option before proceeding.");
            return;
          }
        } else {
          // Add email validation for step 4
          if (currentStep === 4) {
            const emailInput = currentSection.querySelector(
              'input[type="email"]'
            );
            if (emailInput && !emailInput.checkValidity()) {
              emailInput.classList.add("error");
              emailInput.reportValidity(); // Show browser's warning
              return;
            } else if (emailInput) {
              emailInput.classList.remove("error");
            }
          }
          // Regular validation for other steps
          const inputs = currentSection.querySelectorAll(
            "input[required], textarea[required]"
          );
          let isValid = true;

          inputs.forEach((input) => {
            if (!input.value) {
              isValid = false;
              input.classList.add("error");
            } else {
              input.classList.remove("error");
            }
          });

          if (!isValid) {
            alert("Please fill in all required fields before proceeding.");
            return;
          }
        }

        // Proceed to next section
        currentSection.classList.remove("active");
        const nextSection = form.querySelector(
          `.form-section[data-step="${currentStep + 1}"]`
        );
        if (nextSection) {
          nextSection.classList.add("active");
          updateProgress(currentStep + 1);
        }
      });
    });

    // Previous button handler
    form.querySelectorAll(".prev-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const currentSection = button.closest(".form-section");
        const currentStep = parseInt(currentSection.dataset.step);

        currentSection.classList.remove("active");
        const prevSection = form.querySelector(
          `.form-section[data-step="${currentStep - 1}"]`
        );
        if (prevSection) {
          prevSection.classList.add("active");
          updateProgress(currentStep - 1);
        }
      });
    });

    // Update progress bar
    function updateProgress(step) {
      progressSteps.forEach((progressStep) => {
        const stepNum = parseInt(progressStep.dataset.step);
        if (stepNum <= step) {
          progressStep.classList.add("active");
        } else {
          progressStep.classList.remove("active");
        }
      });
    }
  }
  // Initialize phone input
  // Contact form handling - Only run if elements exist
  const callbackPhone = document.querySelector("#callback-phone");
  const contactBtn = document.querySelector(".contact-btn");

  if (callbackPhone && contactBtn) {
    const phoneInput = window.intlTelInput(
      document.querySelector("#callback-phone"),
      {
        preferredCountries: ["pt", "es", "fr", "de", "it"],
        initialCountry: "pt",
        separateDialCode: true,
        utilsScript:
          "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
      }
    );

    // Create error message element
    let errorMsg = document.querySelector(".phone-input .phone-error-msg");
    if (!errorMsg) {
      // Only create if it doesn't exist
      errorMsg = document.createElement("div");
      errorMsg.className = "phone-error-msg";
      document.querySelector(".phone-input").appendChild(errorMsg);
    }
    errorMsg.style.display = "none";

    // Replace the error messages with more professional ones
    const errorMap = [
      "Please enter a complete phone number",
      "This country code is not valid",
      "Phone number is too short",
      "Phone number is too long",
      "Please enter a valid phone number for this country",
    ];

    // Validation function
    const validatePhoneNumber = () => {
      const phoneField = document.querySelector("#callback-phone");
      phoneField.classList.remove("error", "valid");
      errorMsg.style.display = "none";

      if (phoneField.value.trim()) {
        if (phoneInput.isValidNumber()) {
          phoneField.classList.add("valid");
          return true;
        } else {
          phoneField.classList.add("error");
          const errorCode = phoneInput.getValidationError();
          errorMsg.textContent =
            errorMap[errorCode] || "Please provide a valid phone number";
          errorMsg.style.display = "block";
        }
      }
      return false;
    };

    // Add validation on input
    document
      .querySelector("#callback-phone")
      .addEventListener("input", validatePhoneNumber);
    document
      .querySelector("#callback-phone")
      .addEventListener("blur", validatePhoneNumber);

    // Validate phone number on form submit
    const contactButton = document.querySelector(".contact-btn");
    if (contactButton) {
      contactButton.addEventListener("click", function () {
        if (validatePhoneNumber()) {
          const fullNumber = phoneInput.getNumber();

          // Show loading state
          this.textContent = "Sending...";
          this.disabled = true;

          // Send email using EmailJS
          emailjs
            .send(
              "service_4ekh8ho", // Your service ID
              "template_00yzatn", // Replace with your template ID from EmailJS
              {
                email: fullNumber,
                name: "Callback Request",
                message: "Please contact me via WhatsApp.",
                submitTime: new Date().toLocaleString(),
              }
            )
            .then(
              (response) => {
                // Success
                alert("Thank you! We'll contact you soon via WhatsApp.");
                document.querySelector("#callback-phone").value = "";
                this.textContent = "Contact me";
                this.disabled = false;
              },
              (error) => {
                // Error
                alert("Sorry, there was an error. Please try again.");
                console.error("EmailJS error:", error);
                this.textContent = "Contact me";
                this.disabled = false;
              }
            );
        }
      });
    }
  }
  // Handle success page logic

  console.log("Current pathname:", window.location.pathname);
  if (window.location.pathname.includes("success.html")) {
    const formDataString = sessionStorage.getItem("formSubmission");
    console.log("Retrieved form data:", formDataString);

    if (formDataString) {
      try {
        // Parse the stored JSON string back to an object
        const formData = JSON.parse(formDataString);
        console.log("Parsed form data:", formData);

        // Send email with the parsed form data
        emailjs.send("service_4ekh8ho", "template_p42864p", formData).then(
          function (response) {
            console.log("Email sent successfully:", response);
            // Clear the session storage after successful email
            sessionStorage.removeItem("formSubmission");
          },
          function (error) {
            console.error("Failed to send email:", error);
          }
        );
      } catch (error) {
        console.error("Error parsing form data:", error);
      }
    } else {
      // Redirect to home if no form data
      window.location.href = "/Nif4Erasmus/index.html";
    }
  }

  // Add the Intersection Observer code here
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }
  );

  // Observe all elements with fade-in-up class
  document
    .querySelectorAll(".fade-in-up, .fade-in-left, .fade-in-right")
    .forEach((el) => {
      observer.observe(el);
    });
});
