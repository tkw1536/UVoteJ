# UVoteJ

Software for voting @ Jacobs University

Written in NodeJS, will be used for USG Elections.

## Deployment

UVoteJ needs MongoDB. Make sure to set one up.

Currently, LDAP is used for authentication and user management. Other
authentications are also possible, but not yet implemented.

Run:

```bash
cd UVoteJ # Directory the repository was cloned into.
scripts/install # Interactive setup routine
# Edit config/config.json and set yourself as admin.
scripts/run # Run the script
```

The scripts/install routine will write a configuration file to config/config.json
which can should be manually edited.

The only thing that is not configured by the install script is:

* ```auth_admins```: List of admin usernames. The admin interface can be found under /admin.

## Getting started

Get started by going to http://localhost:3000/admin and log in.

## API Documentation
Can be found in "static/doc". To update documentation:

```bash
cd UVoteJ # Directory the repository was cloned into.
scripts/devel # Make sure everything is set up for development
scripts/doc # Update the documentation
```

## TODO

- [x] Admin Edit GUI
    - [x] Phases
    - [x] Options
- [x] Vote GUI
- [x] Results
- [ ] SSO-style authentication


## Wishlist

- [ ] End-user help
- [ ] OpenJUB auth (OpenJUB is not yet done)
- [ ] Client Editing (already partially implemented. )

## License

```
The MIT License (MIT)

Copyright (c) 2014 Tom Wiesing

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
