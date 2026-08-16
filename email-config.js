// EmailJS Configuration for Real-Time Email Notifications
const emailjsConfig = {
    publicKey: "9z9-QMZnWQkxC-Dl_",
    serviceId: "service_ezc1vry",
    templateId: "template_wukls8j"
};

// Initialize EmailJS immediately upon script load
(function() {
    function initEmailJS() {
        if (typeof emailjs !== 'undefined' && emailjsConfig.publicKey) {
            try {
                emailjs.init({
                    publicKey: emailjsConfig.publicKey
                });
                console.log('%c[EMAILJS] Successfully initialized with Public Key: ' + emailjsConfig.publicKey, 'color: #28a745; font-weight: bold;');
            } catch (e) {
                console.error('[EMAILJS] Init failed:', e);
            }
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEmailJS);
    } else {
        initEmailJS();
    }
})();
