import { hashPassword, makeToken, generateId } from "./store.js";

export function registerUser(store, payload) {
  const { username, email, password } = payload;
  if (!username || !email || !password) {
    return { error: "username, email and password are required", status: 400 };
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedUsername = String(username).trim();
  const creatorEmail = String(process.env.CREATOR_EMAIL || "")
    .trim()
    .toLowerCase();

  const duplicated = store.users.find(
    (user) => user.email === normalizedEmail || user.username === normalizedUsername,
  );

  if (duplicated) {
    return { error: "username or email already exists", status: 409 };
  }

  let isCreator = false;
  if (!store.creatorUserId) {
    if (!creatorEmail || creatorEmail === normalizedEmail) {
      isCreator = true;
    }
  }

  const user = {
    user_id: generateId("usr"),
    username: normalizedUsername,
    email: normalizedEmail,
    is_creator: isCreator,
    password_hash: hashPassword(password),
    created_at: new Date().toISOString(),
  };

  store.users.push(user);
  if (isCreator) {
    store.creatorUserId = user.user_id;
  }

  const token = makeToken();
  store.authTokens.set(token, user.user_id);

  return {
    status: 201,
    data: {
      token,
      user: publicUser(user),
    },
  };
}

export function loginUser(store, payload) {
  const { email, password } = payload;
  if (!email || !password) {
    return { error: "email and password are required", status: 400 };
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const passwordHash = hashPassword(password);

  const user = store.users.find(
    (candidate) => candidate.email === normalizedEmail && candidate.password_hash === passwordHash,
  );

  if (!user) {
    return { error: "invalid credentials", status: 401 };
  }

  const token = makeToken();
  store.authTokens.set(token, user.user_id);

  return {
    status: 200,
    data: {
      token,
      user: publicUser(user),
    },
  };
}

export function authenticate(store, req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice("Bearer ".length);
  const userId = store.authTokens.get(token);
  if (!userId) {
    return null;
  }

  return store.users.find((user) => user.user_id === userId) ?? null;
}

export function publicUser(user) {
  return {
    user_id: user.user_id,
    username: user.username,
    email: user.email,
    is_creator: Boolean(user.is_creator),
    created_at: user.created_at,
  };
}
