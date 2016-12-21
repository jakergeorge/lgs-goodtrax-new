# lgs16-good-tracks
Use of the GoodTracks site requires user authentication.
You may use the username: jrg467 password: 1234
or you can simply register a new user.

The home page simply shows a random album that can be added to any of the users lists.

The playlist, wishlist and Listening To pages show albums that a user has saved to each
respective list. The playlist also stores a rating with the album.

The search functionality uses mongo's built-in full text search to match keywords within album documents to the search query.
A user can directly add a search result to any of their lists.

Additionally a user can choose to add an album to the database from Discogs through a form, the album must be of the type: release and not of the type: master release.
Thus all searches on Discogs should be made using a url of this format  https://www.discogs.com/search/?q=<query>&type=release
(if you click the link to search from our search results page, the format will already be correct)
Click on the desired album and copy the Discogs Release ID into the add form. The Discogs ID is the last sequence of numbers in
the url for the album page (eg. https://www.discogs.com/Michael-Jackson-Thriller/release/2911293 -> 2911293 is the release number)


