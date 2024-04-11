import { EdgeDBService } from "@/edgedb/edgedb.service";
import e from "@dbschema/edgeql-js";
import { ConstraintViolationError } from "edgedb";

export const seedRoles = async (dbService: EdgeDBService) => {
  try {
    await dbService.query(
      e.insert(e.auth.Role, {
        name: "User",
        permissions: e.insert(e.auth.Permission, {
          action: "READ",
          subject: "SELF",
        }),
      }),
    );
  } catch (e) {
    if (!(e instanceof ConstraintViolationError)) {
      throw e;
    }
  }
  try {
    await dbService.query(
      e.insert(e.auth.Role, {
        name: "Rep",
        permissions: e.for(
          e.json_array_unpack(
            e.json([
              { action: "CREATE", subject: "USER" },
              { action: "READ", subject: "USER" },
              { action: "UPDATE", subject: "USER" },
            ]),
          ),
          ({ action, subject }) => {
            return e.insert(e.auth.Permission, {
              subject: e.cast(e.auth.PermissionSubject, subject),
              action: e.cast(e.auth.PermissionAction, action),
            });
          },
        ),
      }),
    );
  } catch (e) {
    if (!(e instanceof ConstraintViolationError)) {
      throw e;
    }
  }
  try {
    await dbService.query(
      e.insert(e.auth.Role, {
        name: "Admin",
        permissions: e.for(
          e.json_array_unpack(
            e.json([
              { action: "CREATE", subject: "USER" },
              { action: "READ", subject: "USER" },
              { action: "UPDATE", subject: "USER" },
              { action: "DELETE", subject: "USER" },
            ]),
          ),
          ({ action, subject }) => {
            return e.insert(e.auth.Permission, {
              subject: e.cast(e.auth.PermissionSubject, subject),
              action: e.cast(e.auth.PermissionAction, action),
            });
          },
        ),
      }),
    );
  } catch (e) {
    if (!(e instanceof ConstraintViolationError)) {
      throw e;
    }
  }
};
