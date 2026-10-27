import { randomUUID } from "node:crypto";
import { faker } from "@faker-js/faker";

export interface GeneratedUser {
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  password: string;
}

export interface ProductPayload {
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

export interface UserPayload {
  email: string;
  username: string;
  password: string;
  name: {
    firstname: string;
    lastname: string;
  };
  address: {
    geolocation: {
      lat: string;
      long: string;
    };
    city: string;
    street: string;
    number: number;
    zipcode: string;
  };
  phone: string;
}

export interface CartPayload {
  userId: number;
  date: string;
  products: Array<{
    productId: number;
    quantity: number;
  }>;
}

export function generateUser(): GeneratedUser {
  const email = faker.internet.email();
  const separator = email.lastIndexOf("@");

  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: `${email.slice(0, separator)}.${randomUUID()}${email.slice(separator)}`,
    telephone: faker.phone.number(),
    password: faker.internet.password(),
  };
}

export function generateEmail(): string {
  return faker.internet.email();
}

export function generateProductPayload(): ProductPayload {
  return {
    title: faker.commerce.productName(),
    price: Number(faker.commerce.price()),
    description: faker.commerce.productDescription(),
    image: "https://i.pravatar.cc",
    category: "electronics",
  };
}

export function generateUserPayload(): UserPayload {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    email: faker.internet.email(),
    username: faker.internet.username(),
    password: faker.internet.password(),
    name: {
      firstname: firstName,
      lastname: lastName,
    },
    address: {
      geolocation: {
        lat: String(faker.location.latitude()),
        long: String(faker.location.longitude()),
      },
      city: faker.location.city(),
      street: faker.location.street(),
      number: faker.number.int({ min: 1, max: 9999 }),
      zipcode: faker.location.zipCode(),
    },
    phone: faker.phone.number(),
  };
}

export function generateCartPayload(
  userId: number,
  productId: number,
  quantity: number,
): CartPayload {
  return {
    userId,
    date: new Date().toISOString(),
    products: [{ productId, quantity }],
  };
}
