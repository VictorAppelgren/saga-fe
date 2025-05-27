import { theme } from '$lib/stores/theme';

theme.subscribe((value) => {
	if (typeof document !== 'undefined') {
		document.documentElement.classList.remove('light', 'dark');
		document.documentElement.classList.add(value);
	}
});
