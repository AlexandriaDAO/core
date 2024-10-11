- Add rendering support for text, markdown, json, and html.
  - Remove NSFW check for non image/video content.
- Add nsfw results to redux state
- Wipe the toggle states after each search.

8Pvu_hc9dQWqIPOIcEhtsRYuPtLiQe2TTvhgIj9zmq8
UyuYSWQ67hUvJ1b4k56niVeN88dyanu1X8TsfXo_s5U

/*
Notes:
 - It does a good job with Hentai.

- I'm pretty sure it considered a regular blurred out image to be porn, which is fine I guess. 
- It thinks most nude photagraphy are regular drawings.


- It identified a nude painting as 54% porn. So that's interesting.

- It's also finding a lot of sexy pictures (non-nude) to be neutral. 
- It made a landscape photo 80+% porn so.
*/


Initial Conditions: 

- If porn >50%
- If sexy and porn are both >20%
- Hentai above 25%

