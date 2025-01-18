import requests

def fetch_voice_actors():
    url = "https://graphql.anilist.co"
    query = """
    query($page: Int) {
      Page(page: $page, perPage: 50) {
        pageInfo {
          hasNextPage
          currentPage
        }
        staff {
          id
          name {
            full
          }
          gender
          staffMedia {
            nodes {
              type
            }
          }
        }
      }
    }
    """

    voice_actors = []
    has_next_page = True
    page = 1

    while has_next_page:
        response = requests.post(url, json={"query": query, "variables": {"page": page}})
        data = response.json()

        staff_list = data['data']['Page']['staff']
        for staff in staff_list:
            # Check if the staff has character roles
            if any(media['type'] == "ANIME" for media in staff['staffMedia']['nodes']):
                voice_actors.append({
                    "id": staff['id'],
                    "name": staff['name']['full'],
                    "gender": staff['gender'],
                })

        has_next_page = data['data']['Page']['pageInfo']['hasNextPage']
        page += 1

    return voice_actors

# 実行して結果を表示
voice_actors = fetch_voice_actors()
print(voice_actors)