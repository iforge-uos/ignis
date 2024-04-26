import {useEffect} from "react";

function useDoubleTapEscape(onDoubleTap: () => void, timeout = 300) {
    useEffect(() => {
        let lastTap = 0;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                const now = Date.now();
                if (now - lastTap < timeout) {
                    onDoubleTap();
                }
                lastTap = now;
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onDoubleTap, timeout]);
}

export default useDoubleTapEscape;
