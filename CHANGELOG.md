# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-07-15

### Changed
- Merged the `Stream` and `EnrichedStream` domain concepts into a single module, removing a duplicated representation of stream data.
- Extracted a shared Twitch users-endpoint client, removing duplicated HTTP request logic across services that fetch Twitch user profiles.
- Centralized the mapping from domain errors to HTTP status codes into the global error-handling middleware, replacing scattered per-controller error handling.
- Extracted a shared positive-integer query-parameter parser, removing duplicated validation logic across controllers.
- Relocated the analytics router into `Shared/Infrastructure/Routes` to better reflect the project's layered architecture.
- Split the `TopOfTheTops` aggregate into dedicated `Game` and `Video` domain entities for clearer domain modeling.
- Renamed several internal components for clarity and consistency: `SQLiteGameCacheRepository` to `GameCacheRepository`, `IStreamerExternalRepository` to `IStreamerRepository`, and `TopOfTheTops`'s `TwitchClient` to `TopOfTheTopsTwitchClient`.

### Removed
- Removed the dead `doesUserAlreadyExists` method from `IUserRepository`.

### Fixed
- Fixed the end-to-end test suite silently connecting to the production MySQL database instead of an isolated SQLite instance, preventing tests from reading or writing production data.

## [1.0.0] - 2026-07-14

### Added
- Initial production release of the Twitch Analytics API: user registration and token-based authentication, streamer lookup, stream enrichment with user profile data, and top-of-the-tops analytics backed by the Twitch API, deployed and documented with a Postman collection covering all endpoints.
