export function setCookie(name, value, options = {}) {
    if (typeof value === 'object') {
        value = JSON.stringify(value);
    }

    // Default options
    const defaultOptions = {
        path: '/',                // Cookie is valid for entire site
        expires: 7,              // 7 days by default
        secure: true,            // Only transmitted over HTTPS
        sameSite: 'Strict'       // Protection against CSRF

    };

    const cookieOptions = { ...defaultOptions, ...options };

    // Set expiration date
    if (cookieOptions.expires) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + cookieOptions.expires);
        cookieOptions.expires = expirationDate.toUTCString();
    }

    // Build cookie string
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    // Add options to cookie string
    Object.entries(cookieOptions).forEach(([key, value]) => {
        if (value === true) {
            cookieString += `; ${key}`;
        } else if (value) {
            cookieString += `; ${key}=${value}`;
        }
    });

    document.cookie = cookieString;
}

export function getCookie(name) {
    const cookies = document.cookie.split(';').reduce((acc, current) => {
        const [key, value] = current.split('=').map(item => item.trim());
        try {
            // Attempt to parse JSON values
            acc[decodeURIComponent(key)] = JSON.parse(decodeURIComponent(value));
        } catch {
            // If not JSON, store as is
            acc[decodeURIComponent(key)] = decodeURIComponent(value);
        }
        return acc;
    }, {});

    return cookies[name] || null;
}

export function deleteCookie(name, path = '/') {
    // Delete cookie by setting expiration to past date
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
}

export const convertToUrlSlug = (text) => {
    return text
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
}

export const convertUrlToText = (url) => {
    return url
        .replace(/-/g, ' ') // Replace hyphens with spaces
        .replace(/[^a-zA-Z0-9 ]/g, '') // Remove special characters except spaces
        .split(' ') // Split into words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter of each word
        .join(' '); // Join words with spaces
};
