# Security Specification: Catalizia CorporateGPT

## Data Invariants
1. **Relational Integrity**: 
   - Every GPT must have a valid `userId` pointing to an existing user.
   - Every Document must have a valid `ownerId` pointing to an existing user.
2. **Identity Isolation**:
   - Users cannot modify their own `role`, `isBanned`, `maxQueries`, or `unlimitedUsage` fields.
   - Users cannot impersonate others by setting a different `uid` or `ownerId`.
3. **Temporal Integrity**:
   - `createdAt` is immutable.
   - `updatedAt` must always match `request.time`.
4. **Global Safety**:
   - Only admins (verified email + explicit record) can modify system configurations.
   - Public GET access is forbidden; all reads must be authenticated.

## The Dirty Dozen (Vulnerability Payloads)
1. **Identity Spoofing**: Attempt to create a user profile with a different `uid` than the auth token.
2. **Privilege Escalation**: User tries to update their own role to 'super-admin'.
3. **Ghost Field Mutation**: adding `isAdmin: true` to a GPT document update.
4. **Relational Orphan**: Creating a GPT without a `userId`.
5. **ID Poisoning**: Injecting a 2MB string as a GPT ID.
6. **Bypass Ban**: Banned user attempts to fetch public GPTs.
7. **Cross-Tenant Read**: User A attempts to read User B's private Knowledge Document.
8. **Shadow Update**: Updating a GPT's `name` and silently changing its `ownerId`.
9. **Terminal State Break**: Attempting to un-ban oneself if the status was 'permanent'.
10. **Resource Exhaustion**: Sending an array of 10,000 tags in a GPT profile.
11. **Time Travel**: Manually setting `updatedAt` to a future date.
12. **Unverified Access**: User with unverified email attempting to write to the `admin/config`.

## Security Rules Plan (The Eight Pillars)
- **isValidId helper**: Max 128 chars, regex validation.
- **isValidUser helper**: Strict key check, type safety.
- **isValidGPT helper**: Size limits on metadata, ownership checks.
- **Master Gate**: Access to GPTs/Documents derived from `users` collection lookup.
- **Action-Based Updates**: Distinct checks for "Settings Change" vs "Admin Action".
