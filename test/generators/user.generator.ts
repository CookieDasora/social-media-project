// unfortunately k6 runtime only recognizes modules like this
import { faker } from "../../node_modules/@faker-js/faker/dist/index.cjs";

const usedUsernames = new Set();

export function generateUser() {
	let username: string;

	do {
		const uniqueId = `${faker.number.int({ min: 5, max: 10000 })}_${Math.floor(
			Math.random() * 10000,
		)}`;
		username = `user_${uniqueId}`;
	} while (usedUsernames.has(username));

	usedUsernames.add(username);

	return {
		username,
		email: faker.internet.email().toLowerCase(),
		password: "S@omeSt!0ongPa22sword",
	};
}
