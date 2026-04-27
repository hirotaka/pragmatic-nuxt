import {
  randCompanyName,
  randUserName,
  randEmail,
  randParagraph,
  randUuid,
  randPassword,
  randCatchPhrase,
  randText,
} from "@ngneat/falso";

const generateUser = () => ({
  id: randUuid() + Math.random(),
  firstName: randUserName({ withAccents: false }),
  lastName: randUserName({ withAccents: false }),
  email: randEmail(),
  password: randPassword(),
  teamId: randUuid(),
  teamName: randCompanyName(),
  role: "ADMIN",
  bio: randParagraph(),
  createdAt: Date.now(),
});

export const createUser = <T extends Partial<ReturnType<typeof generateUser>>>(
  overrides?: T,
) => {
  return { ...generateUser(), ...overrides };
};

const generateTeam = () => ({
  id: randUuid(),
  name: randCompanyName(),
  description: randParagraph(),
  createdAt: Date.now(),
});

export const createTeam = <T extends Partial<ReturnType<typeof generateTeam>>>(
  overrides?: T,
) => {
  return { ...generateTeam(), ...overrides };
};

const generateDiscussion = () => ({
  title: randCatchPhrase(),
  body: randText({ charCount: 50 }),
});

export const createDiscussion = <T extends Partial<ReturnType<typeof generateDiscussion>>>(
  overrides?: T,
) => {
  return { ...generateDiscussion(), ...overrides };
};

const generateComment = () => ({
  body: randParagraph(),
});

export const createComment = <T extends Partial<ReturnType<typeof generateComment>>>(
  overrides?: T,
) => {
  return { ...generateComment(), ...overrides };
};
