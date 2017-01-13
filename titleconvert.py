# This is only meant to be used with a titles.json file obtained from the internet.
# This repository does not host any copyrighted content including title keys.
# This script is intended to run with python3.
# Ridley Larsen 2017

import json
import unicodedata

def strip_accents(s):
   return ''.join(c for c in unicodedata.normalize('NFD', s)
                  if unicodedata.category(c) != 'Mn')


def main():
    f = open("titles.json", "r")
    fr = f.read()
    f.close()
    titles = json.loads(fr)
    games = {
        "USA": [],
        "EUR": [],
        "JPN": [],
        "CHN": [],
        "KOR": [],
        "TWN": [],
    }
    for game in titles['games']:
        # Update files don't have save games, so remove them from the DB.
        if "update" in game["name"].lower():
            continue
        # Strip some characters from the game names. Firebase doesn't like some special characters in key names.
        game["name"] = game["name"].replace(u"\u2122", '') # TM Symbol
        game["name"] = game["name"].replace("$", 's')
        game["name"] = game["name"].replace("#", '')
        game["name"] = game["name"].replace("[", '')
        game["name"] = game["name"].replace("]", '')
        game["name"] = game["name"].replace("/", '')
        game["name"] = game["name"].replace(".", '')

        # Use the game's lowercased title as the search index and remove more special characters.
        game["search_name"] = strip_accents(game["name"])
        game["search_name"] = game["search_name"].lower()
        game["search_name"] = game["search_name"].replace(":", '')
        game["search_name"] = game["search_name"].replace("!", '')

        game["saves"] = []

        del game["encTitleKey"]
        del game["titleKey"]
        if game['region'] == "EUREUR":
            game['region'] = "EUR"
        if game['region'] == "ALL":
            for k in games.keys():
                games[k].append(game)
        else:
            if game['region']:
                games[game['region']].append(game)
    
    # Sanity Check
    print(len(games["USA"]))

    games = {"games": games}

    w = open("titles_converted.json", "w")
    w.write(json.dumps(games))
    w.close()

if __name__=="__main__":
    main()
