# UVoteJ

Software for voting @ Jacobs University

Written in NodeJS, will be used for USG Elections.

## Deployment

UVoteJ needs MongoDB. Make sure to set one up.

Currently, LDAP is used for authentication and user management. In the future,
custom logins can also be used.

Run:

```bash
cd UVoteJ # Directory the repository was cloned into.
scripts/install # Interactive setup routine
scripts/run # Run the script
```

or on Windows:

```
cd UVoteJ
scripts\install
scripts\run
```

The scripts/install routine will write a configuration file to config/config.json
which can also be manually edited. 


## Documentation
Can be found in "static/doc". To update documentation:

```bash
cd UVoteJ # Directory the repository was cloned into.
scripts/devel # Make sure everything is set up for development
scripts/doc # Update the documentation
```

or on Windows:

```
cd UVoteJ
scripts\devel
scripts\doc
```

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
