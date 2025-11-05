import { CALENDAR_ITENS_MOCK, USERS_MOCK } from "@packages/ui/calendar/mocks";

export const getEvents = async () => {
  // TO DO: implement this
  // Increase the delay to better see the loading state
  // await new Promise(resolve => setTimeout(resolve, 800));
  return CALENDAR_ITENS_MOCK;
};

export const getUsers = async () => {
  // TO DO: implement this
  // Increase the delay to better see the loading state
  // await new Promise(resolve => setTimeout(resolve, 800));
  return USERS_MOCK;
};
