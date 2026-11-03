# 💻 Application Overview

The application is relatively simple. Users can create teams where other users can join, and they start discussions on different topics between each other.

A team is created during the registration if the user didn't choose to join an existing team and the user becomes the admin of it.

[Demo](https://bulletproof-nuxt.pages.dev)

## Data model

The application contains the following models:

- User - can have one of these roles:

  - `ADMIN` can:
    - create discussions and edit/delete own discussions
    - create comments and delete comments within their team
    - delete other users within their team
    - edit own profile
  - `USER` - can:
    - create discussions and edit/delete own discussions
    - edit own profile
    - create/delete own comments

- Team: represents a team whose members participate in discussions.

- Discussion: represents discussions created by team members.

- Comment: represents all the messages in a discussion.

Server-side team and ownership checks are described in [Security](security.md).

## Get Started

To get started, check the [README.md](../../apps/bulletproof-nuxt/README.md) file.
