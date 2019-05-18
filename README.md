# MMM-HotLunch

A [MagicMirror²](https://github.com/MichMich/MagicMirror) module that shows school lunch menus in Montclair, NJ, USA. 

![image](docs/screenshot.png)

It is not yet particuarly robust or configurable, so it's not likely to be usable by anyone else out of the box. I'm sharing it in case someone finds it useful as a template for making their own module that fetches data from some public source on the web. 

## Installation

Install like any other MagicMirror² module. There are no external dependencies. 

```
$ cd MagicMirror/modules
$ git clone https://github.com/jasonluther/MMM-HotLunch
```

Configure `MagicMirror/config/config.js`:

```
{
    module: 'MMM-HotLunch',
    position: 'top_left',
    config: {
        /* defaults: */
        updateInterval: 60 * 60 * 1000,
        url: 'https://...',
    }
},
```

Finally, restart your magic mirror: `$ pm2 restart all`.

## Menu Data

The [menu](https://www.schoolnutritionandfitness.com/webmenus2/#/view?id=5c829b1c534a135521ca0f8c&siteCode=3830) comes from the school system's food service provider. The data is served to their own web menu using [GraphQL](https://graphql.org/), which I had never encoutered before. 

### Generating the query

The easiest way to get the query URL is to use Chrome's developer tool and grab the request from the Network tab. 

For example, [this](https://api.isitesoftware.com//graphql?query=%0A++++++++++++%7B%0A++++++++++++++++s0:site(depth:0,+id:+%223830%22)%7Bid+name+logo_url%7D%0A++++++++++++++++menu(id:%225c829b1c534a135521ca0f8c%22)+%7B%0A++++++++++++++++++++id%0A++++++++++++++++++++bg%0A++++++++++++++++++++weeksForCycle%0A++++++++++++++++++++isTwoPages%0A++++++++++++++++++++month%0A++++++++++++++++++++year%0A++++++++++++++++++++cachedFontSize%0A++++++++++++++++++++menuType+%7B%0A++++++++++++++++++++++++id%0A++++++++++++++++++++++++name%0A++++++++++++++++++++++++formats%0A++++++++++++++++++++++++listMenuIDs,%0A++++++++++++++++++++++++sitePaths+%7B%0A++++++++++++++++++++++++++sites+%7B%0A++++++++++++++++++++++++++++id,%0A++++++++++++++++++++++++++++name%0A++++++++++++++++++++++++++%7D%0A++++++++++++++++++++++++%7D%0A++++++++++++++++++++%7D%0A++++++++++++++++++++items+%7B%0A++++++++++++++++++++++++day%0A++++++++++++++++++++++++product+%7B%0A++++++++++++++++++++++++++++%0A%0Aid%0Aname%0Arating_average%0Arating_count%0Aallergen_dairy%0Aallergen_egg%0Aallergen_fish%0Aallergen_gluten%0Aallergen_milk%0Aallergen_peanut%0Aallergen_pork%0Aallergen_shellfish%0Aallergen_soy%0Aallergen_treenuts%0Aallergen_vegetarian%0Aallergen_wheat%0Aallergen_other%0AcustomAllergens%0Aallow_online_ordering%0Abeans_peas_legumes%0Acategory%0Aenabled%0Afood_group%0Afruit%0Afruit_juice%0Agrains%0Agreen_vegetable%0Ahide_on_calendars%0Ahide_on_mobile%0Aimage_url1%0Aimage_url2%0Ais_ancillary%0Along_description%0Ameal%0Ameat%0Amilk%0Aother_vegetable%0Apdf_url%0Aportion_size%0Aportion_size_unit%0Aprice%0Aprod_allergens%0Aprod_calcium%0Aprod_calories%0Aprod_carbs%0Aprod_cholesterol%0Aprod_dietary_fiber%0Aprod_gram_weight%0Aprod_iron%0Aprod_mfg%0Aprod_protein%0Aprod_sat_fat%0Aprod_sodium%0Aprod_total_fat%0Aprod_trans_fat%0Aprod_vita_iu%0Aprod_vita_re%0Aprod_vitc%0Aproduct_fullname%0AproductID%0AproviderProductID%0Ared_vegetable%0Astarchy_vegetable%0Asugar%0Atrash+%0Atotal_gram_weight%0Avegetable%0Avisible_month_cal%0Awhole_grain+%0Ahide_on_calendars+%0Ahide_on_web_menu_view%0Aglobal%0A+++%0A++++++++++++++++++++++++%7D%0A++++++++++++++++++++%7D%0A++++++++++++++++++++previousMonthPublished+%7B+id+%7D%0A++++++++++++++++++++nextMonthPublished+%7B+id+%7D%0A++++++++++++++++++++OnlineMenuDesignSettings+%7B%0A++++++++++++++++++++++++customAllergens+%7B%0A++++++++++++++++++++++++++++field%0A++++++++++++++++++++++++++++img%0A++++++++++++++++++++++++++++label%0A++++++++++++++++++++++++++++tooltip%0A++++++++++++++++++++++++++++showAllergenIconOnMenu%0A++++++++++++++++++++++++%7D%0A++++++++++++++++++++++++nutrientsDisabled%0A++++++++++++++++++++++++allergenFilterEnabled%0A++++++++++++++++++++++++showPriceOnPopovers%0A++++++++++++++++++++++++disableAllergen%0A++++++++++++++++++++++++showAllergens%0A++++++++++++++++++++++++sid%0A++++++++++++++++++++++++disableNutritionReportCard++++++++++++++++++++++++%0A++++++++++++++++++++++++categoryToBold%0A++++++++++++++++++++++++onlineMealAppEnabled%0A++++++++++++++++++++++++onlineMealAppGraphic%0A++++++++++++++++++++++++onlineMealAppUrl%0A++++++++++++++++++++++++onlinePaymentProviderEnabled%0A++++++++++++++++++++++++onlinePaymentProviderGraphic%0A++++++++++++++++++++++++onlinePaymentProviderUrl%0A++++++++++++++++++++++++showAllergenIconOnMenu%0A++++++++++++++++++++++++web_menu_view_header_image_url%0A++++++++++++++++++++++++automaticItemSorting%0A++++++++++++++++++++++++hideCategoryHeaders%0A++++++++++++++++++++++++disableChainedSelects%0A++++++++++++++++++++++++dropdownMenuExcludeSchools%0A++++++++++++++++++++++++hideAllergensInNutritionReportCard%0A++++++++++++++++++++++++ratingDisableComments%0A++++++++++++++++++++++++disableTranslateWidget%0A++++++++++++++++++++%7D%0A++++++++++++++++%7D%0A++++++++++++%7D%0A++++++++++++) is the URL for this month's menu. If you visit it in a browser, you get a convenient UI to modify the query. 

I trimmed down the [request](docs/graphql-menu-query.txt) and used Perl to trim the whitespace and URL-encode it with `URI::Escape`. 

## To Do

I haven't dealt with fetching next month's menu yet. 

## License

As the MagicMirror² project and the modules are MIT-licensed, I will reproduce the license here. 

Most of the code is boilerplate from MM2 documentation, or it is copied from online forums or other documentation sources. Links to sources are in the comments. 

### The MIT License (MIT)

Copyright © 2016-2017 Michael Teeuw  
Copyright © 2019 Jason Luther

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

The software is provided “as is”, without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.