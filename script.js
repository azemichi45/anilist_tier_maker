function initialize() {
    const seasonYearInput = document.getElementById("seasonYear");
    const seasonInput = document.getElementById("season");

    const closeSettingsButton = document.getElementById('close-settings');
    const today = new Date();

    const settingsModal = document.getElementById('settings-modal');
    // 年と季節を現在時刻に合わせて今の時期にする
    seasonYearInput.value = today.getFullYear();
    let options = seasonInput.options;
    options[Math.ceil((today.getMonth() + 1) / 3) - 1].selected = true;

    // モーダルウィンドウの閉じる機能作成
    // 設定画面を閉じる
    closeSettingsButton.addEventListener('click', () => {
        settingsModal.style.display = 'none'; // モーダルを非表示
    });

    // モーダルの背景をクリックして閉じる
    settingsModal.addEventListener('click', (event) => {
        if (event.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });
}

function createTierRow(tierName) {
    // Create the main container div
    const tierRow = document.createElement('div');
    tierRow.className = 'tier-row';
    tierRow.setAttribute('data-tier', tierName);

    // Create the tier label div
    const tierLabel = document.createElement('div');
    tierLabel.className = 'tier-label';

    // Create the h2 element and set attributes
    const h2 = document.createElement('h2');
    h2.contentEditable = 'true';
    h2.textContent = tierName;

    // Append h2 to the tier label
    tierLabel.appendChild(h2);

    // Create the tier images div
    const tierImages = document.createElement('div');
    tierImages.className = 'tier-images';
    tierImages.innerHTML = '<!-- 画像がここにドラッグ＆ドロップされる -->';

    // Create setting control
    const settingsControl = document.createElement('div');
    settingsControl.className = 'settings-control'

    // 設定ボタン
    const settings = document.createElement('div');
    settings.className = 'settings fa-solid fa-gear';
    settings.addEventListener('click', () => {
        // 設定ボタンのモーダルウィンドウの機能実装
        const settingsModal = document.getElementById('settings-modal');
        const deleteRowButton = document.getElementById('delete-row-button');
        const clearRowButton = document.getElementById('clear-row-button');
        const addRowAboveButton = document.getElementById('add-row-above-button');
        const addRowBelowButton = document.getElementById('add-row-below-button');
        const currentRow = settings.closest('.tier-row');

        // delete Row Button
        deleteRowButton.onclick = () => {

            const imagePool = document.getElementById("imagePool");
            currentRow.querySelectorAll(".tier-item").forEach(item => {
                imagePool.appendChild(item);
            });
            currentRow.remove();
            settingsModal.style.display = 'none';
        };

        // clear row image button
        clearRowButton.onclick = () => {

            const imagePool = document.getElementById("imagePool");
            currentRow.querySelectorAll(".tier-item").forEach(item => {
                imagePool.appendChild(item);
            });
            settingsModal.style.display = 'none';
        };

        // add row above button
        addRowAboveButton.onclick = () => {
            const tierList = currentRow.parentNode; // 親要素（tier-list）

            const newTierRow = createTierRow("NEW"); // 新しい行を作成
            tierList.insertBefore(newTierRow, currentRow);
            settingsModal.style.display = 'none';
        };

        // add row below button
        addRowBelowButton.onclick = () => {
            const tierList = currentRow.parentNode; // 親要素（tier-list）
            const nextRow = currentRow.nextElementSibling; // 現在の行の次の行
            const newTierRow = createTierRow("NEW"); // 新しい行を作成
            if (nextRow) {
                tierList.insertBefore(newTierRow, nextRow); // 次の行の前に挿入
            } else {
                tierList.appendChild(newTierRow); // 次の行がない場合は末尾に追加
            }
            settingsModal.style.display = 'none';
        };

        // モーダルウィンドウ表示
        settingsModal.style.display = 'flex';

    });
    settingsControl.appendChild(settings);

    // Create move buttons
    const moveButtons = document.createElement('div');
    moveButtons.className = 'move-buttons';

    const moveUp = document.createElement('div');
    moveUp.className = 'move-up fa-solid fa-chevron-up';
    moveUp.addEventListener('click', () => {
        // 現在の tier-row を取得
        const currentRow = moveUp.closest('.tier-row');

        // 一つ上の tier-row を取得
        const previousRow = currentRow.previousElementSibling;

        // 一つ上の行が存在する場合のみ処理
        if (previousRow) {
            // 親要素を取得
            const parent = currentRow.parentNode;

            // 現在の行を一つ上の行の前に移動
            parent.insertBefore(currentRow, previousRow);

            console.log(`Moved row ${currentRow.dataset.tier} above ${previousRow.dataset.tier}`);
        } else {
            console.log('No row above to swap with.');
        }
    });
    const moveDown = document.createElement('div');
    moveDown.className = 'move-down fa-solid fa-chevron-down';

    moveDown.addEventListener('click', () => {
        const currentRow = moveDown.closest('.tier-row');
        const nextRow = currentRow.nextElementSibling;

        if (nextRow) {
            const parent = currentRow.parentNode;
            parent.insertBefore(nextRow, currentRow); // 次の行を現在の行の前に移動
            console.log(`Moved row ${currentRow.dataset.tier} below ${nextRow.dataset.tier}`);
        } else {
            console.log('No row below to swap with.');
        }
    });
    moveButtons.appendChild(moveUp);
    moveButtons.appendChild(moveDown);

    settingsControl.appendChild(moveButtons);


    // drag and drop
    Sortable.create(tierImages, {
        group: "shared", animation: 150,
    });
    // Append the label and images divs to the main container
    tierRow.appendChild(tierLabel);
    tierRow.appendChild(tierImages);
    tierRow.appendChild(settingsControl);

    return tierRow;
}
async function getSeasonAnimeImageUrl(seasonYear, season, formatType, previous = false) {
    const url = "https://graphql.anilist.co";
    const episodes_greater = 23
    // $マークがqueryのキーとjavascriptの文字列埋め込みでかぶっててわかりにくい
    // {}の手前は文字列埋め込みの記号
    const query = `
    query($page: Int, $season: MediaSeason, $seasonYear: Int, $format: [MediaFormat] ${previous ? ', $episodes_greater: Int' : ''}) {
        Page(page: $page, perPage: 50) {
            pageInfo {
                hasNextPage
            }
            media(season: $season, seasonYear: $seasonYear, format_in: $format, type: ANIME, ${previous ? ', episodes_greater: $episodes_greater' : ''}) {
                title {
                    romaji
                }
                coverImage {
                    large
                    medium
                }
                duration
                episodes
                season
                seasonYear
                siteUrl
            }
        }
    }`;

    let allImages = [];
    let hasNextPage = true;
    let page = 1;

    while (hasNextPage) {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query,
                variables: {
                    season,
                    seasonYear,
                    format: formatType,
                    episodes_greater: episodes_greater,
                    page,
                },
            }),
        });

        const data = await response.json();
        const pageData = data.data.Page;
        const images = pageData.media
            .filter(media => media.duration === null || media.duration > 7) // 明確なショートアニメを除外
            .map(media => ({
                siteUrl: media.siteUrl,
                title: media.title.romaji,
                imgUrl: media.coverImage["medium"],
            }));

        allImages = allImages.concat(images);
        hasNextPage = pageData.pageInfo.hasNextPage;
        page++;
    }

    return allImages;
}

document.getElementById("fetchButton").addEventListener("click", async () => {
    resetTierlist();

    const seasonYearInput = document.getElementById("seasonYear");
    const seasonSelect = document.getElementById("season");

    const optionsArray = Array.from(seasonSelect.options).map(option => option.value);
    const seasonYear = seasonYearInput.value;
    const season = seasonSelect.value;
    const includePreviousSeasonCheckBox = document.getElementById("include-previous-season");
    const noResults = document.getElementById("no-results");
    const imagePool = document.getElementById("imagePool");

    let images = await getSeasonAnimeImageUrl(seasonYear, season, ["TV", "ONA"]);
    console.log(images);
    if (includePreviousSeasonCheckBox.checked) {
        const seasonIndex = seasonSelect.selectedIndex;
        const previousSeasonIndex = (seasonIndex - 1 + optionsArray.length) % optionsArray.length;
        const previousSeason = optionsArray[previousSeasonIndex];
        let previousSeasonYear = seasonYear;
        if (seasonIndex === 0) {
            previousSeasonYear -= 1;
        }
        const previousSeasonAnime = await getSeasonAnimeImageUrl(previousSeasonYear, previousSeason, ["TV", "ONA"], true);

        images = [...images, ...previousSeasonAnime]

    }
    Sortable.create(imagePool, {
        group: "shared", animation: 150,
    });
    imagePool.innerHTML = ""; // Clear existing images

    // 結果がなかったときNo Resultsと表示
    if (images.length) {
        noResults.style.display = 'none';
    }
    else {
        noResults.style.display = 'flex';
    }

    images.forEach(data => {
        const item = document.createElement("div");
        item.classList.add("tier-item");
        item.setAttribute("draggable", "true");
        item.setAttribute("data-title", data.title);

        const img = document.createElement("img");
        img.src = data.imgUrl;
        img.alt = data.title;
        img.customData = data;
        item.addEventListener("dblclick", () => {
            // ダブルクリック時anilistのページを新しいタブで開く
            window.open(data.siteUrl, "_blank");
        });
        item.appendChild(img);
        imagePool.appendChild(item);

    });
});

document.addEventListener("DOMContentLoaded", function () {
    // 初期tierの作成
    const tiers = document.querySelectorAll(".tier-images");
    const tierList = document.querySelector('.tier-list');
    const DEFAULT_TIERS = ['S', 'A', 'B', 'C', 'D']
    for (tier of DEFAULT_TIERS) {
        tierList.appendChild(createTierRow(tier));
    }
    initialize();

    tiers.forEach(tier => {
        Sortable.create(tier, {
            group: "shared", animation: 150,
        });
    });


    // Output JSON functionality
    document.querySelector(".output-button").addEventListener("click", () => {
        const seasonYear = document.getElementById("seasonYear").value;
        const season = document.getElementById("season").value;
        const output = {};
        let md = "";
        // tier-rowの現在の状態をjsonに変換
        document.querySelectorAll(".tier-row").forEach(row => {
            const tierName = row.querySelector("h2").textContent.trim();
            const animes = Array.from(row.querySelectorAll(".tier-item img")).map(img => img.customData);
            output[tierName] = animes;

        });
        md += `# ~~~${seasonYear} ${season} Anime Tier List~~~\n`

        for (const property in output) {
            // 空のtierは書かない
            if (output[property].length === 0) {
                continue;
            }
            // tier名書き込み
            md += `## ~~~${property}~~~\n`
            for (const data of output[property]) {
                // mdに画像を書き込み
                md += `[![${data.title}](${data.imgUrl} "${data.title}")](${data.siteUrl})`;
            }
            md += '\n'
        }
        console.log(md);
        // クリップボードにコピー
        navigator.clipboard.writeText(md)
            .then(() => {
            })
            .catch(err => {
                console.error("クリップボードへのコピーに失敗しました: ", err);
            });
    });


    // document.querySelector(".add-tier-button").addEventListener("click", () => {
    //     const tierList = document.querySelector(".tier-list");
    //
    //     // 新しいティア行を作成
    //     const newTierRow = createTierRow("NEW")
    //     // 新しいティア行をティアリストに追加
    //     tierList.appendChild(newTierRow);
    //
    // });
    // Reset Tierlist functionality
    document.getElementById("resetButton").addEventListener("click", resetTierlist);
});

function resetTierlist() {
    const imagePool = document.getElementById("imagePool");
    document.querySelectorAll(".tier-row .tier-item").forEach(item => {
        imagePool.appendChild(item);
    });
}

