// @ts-nocheck
import { FormData } from "https://jslib.k6.io/formdata/0.0.2/index.js";
import { check, sleep } from "k6";
import http from "k6/http";
import { Options } from "k6/options";
// @ts-ignore
import { generateUser } from "./generators/user.generator.ts";

// biome-ignore lint/style/useConst: it's like that on the wiki
export let options: Options = {
	scenarios: {
		smoke_test: {
			executor: "constant-vus",
			exec: "smoke_test",
			vus: 20,
			duration: "5s",
			env: { NODE_ENV: "dev" },
		},
		load_test: {
			executor: "ramping-vus",
			exec: "load_test",
			startTime: "5s",
			stages: [
				{ target: 15, duration: "30s" },
				{ target: 15, duration: "1m" },
				{ target: 30, duration: "1m30s" },
				{ target: 55, duration: "2m" },
				{ target: 0, duration: "10s" },
			],
			env: { NODE_ENV: "dev" },
		},
	},
	thresholds: {
		"http_req_duration{scenario:smoke_test}": ["p(95)<50"], // smoke_test: 95% of the requests must be under 50ms
		"http_req_failed{scenario:smoke_test}": ["rate<0.01"], // smoke_test: Less than 1% acceptable errors
		"http_req_duration{scenario:load_test}": ["p(95)<90"], // load_test: 95% of the requests must be under 90ms
		"http_req_failed{scenario:load_test}": ["rate<0.01"], // load_test: less than 1% acceptable errors
	},
};

const BASE_URL = "http://localhost:8080/v1";

export function smoke_test() {
	const index_req = http.get("http://localhost:8080/");
	check(index_req, {
		"Response successful": (r) => r.status === 200,
	});

	sleep(1);
}

export function load_test() {
	executeUserFlow();
}

function executeUserFlow() {
	const user = generateUser();

	// Create user
	const createUser = http.post(`${BASE_URL}/users`, JSON.stringify(user), {
		headers: { "Content-Type": "application/json" },
	});

	check(createUser, {
		"User created successfully": (r) => r.status === 201,
	});

	if (createUser.status !== 201) return;

	sleep(1);

	// Auth user
	const authPayload = { username: user.username, password: user.password };
	const authUser = http.post(`${BASE_URL}/auth`, JSON.stringify(authPayload), {
		headers: { "Content-Type": "application/json" },
	});

	check(authUser, {
		"User authenticated successfully": (r) => r.status === 200,
	});

	const authToken = authUser.json("token");
	if (!authToken) return;

	const headers = {
		Authorization: `Bearer ${authToken}`,
	};

	sleep(1);

	// Create post
	const fd = new FormData();
	fd.append("content", "Example post k6");
	fd.append("attachments", "");
	const createPost = http.post(`${BASE_URL}/kweeks`, fd.body(), {
		headers: {
			"Content-Type": `multipart/form-data; boundary=${fd.boundary}`,
			...headers,
		},
	});

	check(createPost, {
		"Post created successfully": (r) => r.status === 201,
	});

	const postId = createPost.json("id");
	if (!postId) return;

	sleep(1);

	// Like post
	const likePost = http.post(`${BASE_URL}/kweeks/${postId}/like`, null, {
		headers,
	});
	check(likePost, {
		"Post liked successfully": (r) => r.status === 201,
	});

	sleep(1);

	// Get user info
	const userInfo = http.get(`${BASE_URL}/users/${user.username}`, { headers });
	check(userInfo, {
		"User profile loaded successfully": (r) => r.status === 200,
	});

	sleep(1);

	// Delete post
	const deletePost = http.del(`${BASE_URL}/kweeks/${postId}`, null, {
		headers,
	});
	check(deletePost, {
		"Post deleted successfully": (r) => r.status === 200,
	});

	sleep(1);

	// Delete user
	const deleteUser = http.del(`${BASE_URL}/users`, null, { headers });
	check(deleteUser, {
		"User deleted successfully": (r) => r.status === 200,
	});

	sleep(1);
}
