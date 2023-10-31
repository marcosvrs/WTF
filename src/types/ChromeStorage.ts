type ChromeStorage = {
	message?: string;
	delay?: number;
	prefix?: number;
	attachment?: {
		url: string;
		name: string;
		type: string;
		lastModified: number;
	};
	buttons?: Array<{
		id: number;
		text: string;
		phoneNumber: string;
		url: string;
	}>;
	logs?: Array<{
		level: number;
		message: string;
		attachment: boolean;
		contact: string;
		date?: string;
	}>;
};

export default ChromeStorage;