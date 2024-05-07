/** If an error can feasibly be hit by the UI it should have an associated error code for checking against on the front end */
export enum ErrorCodes {
  //#region sign in
  not_registered,
  already_registered,
  ldap_not_found,
  already_signed_in_to_location,
  queue_full,
  location_full_and_queue_disabled,
  agreement_not_signed,
  not_in_queue,
  agreement_already_signed,
  not_rep,
  not_signed_in,
  queue_disabled,
  user_has_active_infractions,
  compulsory_training_missing,
  //#endregion
  //#region training
  interactable_not_found,
  user_trying_to_complete_rep_training,
  //#endregion
  //#region auth
  csrf_error,
  //#endregion
}
