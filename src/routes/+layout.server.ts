export async function load({ cookies }: any) {
	const userCookie = cookies.get('user');
	
	if (!userCookie) {
		return { user: null };
	}

	try {
		const user = JSON.parse(userCookie);
		return { user };
	} catch {
		return { user: null };
	}
};
