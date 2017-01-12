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
        if "update" in game["name"].lower():
            continue
        game["name"] = game["name"].replace(u"\u2122", '')
        game["name"] = game["name"].replace("$", 's')
        game["name"] = game["name"].replace("#", '')
        game["name"] = game["name"].replace("[", '')
        game["name"] = game["name"].replace("]", '')
        game["name"] = game["name"].replace("/", '')
        game["name"] = game["name"].replace(".", '')

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

    print(len(games["USA"]))

    games = {"games": games}

    w = open("titles_converted.json", "w")
    w.write(json.dumps(games))
    w.close()

if __name__=="__main__":
    main()
