/** If an error can feasibly be hit by the UI it should have an associated error code for checking against on the front end */
export enum ErrorCodes {
  //#region sign in
  not_registered = 0,
  already_registered = 1,
  ldap_not_found = 2,
  already_signed_in_to_location = 3,
  queue_full = 4,
  location_full_and_queue_disabled = 5,
  agreement_not_signed = 6,
  not_in_queue = 7,
  agreement_already_signed = 8,
  not_rep = 9,
  not_signed_in = 10,
  queue_disabled = 11,
  user_has_active_infractions = 12,
  //#endregion
  //#region training
  interactable_not_found = 13,
  user_trying_to_complete_rep_training = 14,
  //#endregion
}
