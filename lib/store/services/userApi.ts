import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface User {
  gender: string;
  name: {
    title: string;
    first: string;
    last: string;
  };
  email: string;
  login: {
    uuid: string;
    username: string;
    password: string;
  };
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
  phone: string;
  cell: string;
  dob: {
    date: string;
    age: number;
  };
  location: {
    street: {
      number: number;
      name: string;
    };
    city: string;
    state: string;
    country: string;
    postcode: string;
  };
}

interface RandomUserResponse {
  results: User[];
  info: {
    seed: string;
    results: number;
    page: number;
    version: string;
  };
}

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://randomuser.me/api/" }),
  endpoints: (builder) => ({
    getUsers: builder.query<User[], number>({
      query: (count = 10) => `?results=${count}`,
      transformResponse: (response: RandomUserResponse) => response.results,
    }),
    getUserById: builder.query<User, string>({
      query: (id) => `?seed=${id}&results=1`,
      transformResponse: (response: RandomUserResponse) => response.results[0],
    }),
  }),
});

export const { useGetUsersQuery, useGetUserByIdQuery } = usersApi;
