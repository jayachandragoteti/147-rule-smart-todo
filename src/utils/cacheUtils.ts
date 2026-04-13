/**
 * Utility functions for browser cache management
 */
export const clearBrowserCacheAndReload = async () => {
    if (window.caches) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
    }
    window.location.reload();
};
