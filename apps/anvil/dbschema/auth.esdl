module auth {
    type BlacklistedToken {
        annotation description := "Used to mark JWTs as invalid";
        required token: str {
            constraint exclusive;
        };
        required expires: datetime;
    }

    type Role {
        required name: str {
            constraint exclusive;
        };
        multi permissions: Permission;
    }

    scalar type PermissionAction extending enum<
        READ,
        `UPDATE`,  # backticked to avoid conflict with keywords
        `CREATE`,
        `DELETE`,
    >;

    scalar type PermissionSubject extending enum<
        ALL,
        SELF,
        USER,
    >;

    type Permission {
        required action: PermissionAction;
        required subject: PermissionSubject;
        index on ((.action, .subject));
    }
}