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


    const selectLanguage = document.getElementById("language");
    const languageSelectedIndex = getCookie("languageSelectedIndex");
    selectLanguage.selectedIndex = languageSelectedIndex;
    selectLanguage.addEventListener('change', (e) => {

        const language = e.target.value;
        setCookie("languageSelectedIndex", e.target.selectedIndex, 365);

        document.querySelectorAll(".tier-item").forEach(item => {
            item.setAttribute("data-title", item.firstChild.customData.title[language]);
        });

    });

    initTierList();
    initCopyMdButton();
}

function initTierList() {

    // 初期tierの作成
    const tiers = document.querySelectorAll(".tier-images");
    const tierList = document.querySelector('.tier-list');
    const DEFAULT_TIERS = ['S', 'A', 'B', 'C', 'D'];
    for (tier of DEFAULT_TIERS) {
        tierList.appendChild(createTierRow(tier));
    }

    tiers.forEach(tier => {
        Sortable.create(tier, {
            group: "shared", animation: 150,
        });
    });
}

function initCopyMdButton() {
    const copyMdButton = document.querySelector(".output-button");
    // ボタンの初期テキストと背景色を保存しておく
    const originalText = copyMdButton.textContent;
    const originalBackgroundColor = copyMdButton.style.backgroundColor;

    // floatをキャストするせいでボタンが改行されるので1を足す
    const originalWidth = copyMdButton.offsetWidth + 1;
    copyMdButton.style.width = originalWidth + "px";
    // Output JSON functionality
    copyMdButton.addEventListener("click", () => {
        const seasonYear = document.getElementById("seasonYear").value;
        const season = document.getElementById("season").value;

        const md = generateMarkdown(seasonYear, season);

        console.log(md);
        // クリップボードにコピー
        navigator.clipboard.writeText(md)
            .then(() => {
                // コピー成功時に成功を知らせるアニメーションを描画
                copyMdButton.textContent = "Copied!";
                copyMdButton.style.backgroundColor = "green";

                // 0.75秒後に元の状態に戻す
                setTimeout(() => {
                    copyMdButton.textContent = originalText;
                    copyMdButton.style.backgroundColor = originalBackgroundColor;
                }, 750);
            })
            .catch(err => {
                console.error("クリップボードへのコピーに失敗しました: ", err);
            });
    });
}

// Cookieに値を保存
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + "; path=/" + expires;
}

// Cookieから値を取得
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
function generateMarkdown(seasonYear, season) {
    const output = {};
    const language = document.getElementById("language").value.toLowerCase();
    let md = `# ~~~${seasonYear} ${season} Anime Tier List~~~\n`;

    // tierlistのデータをobjectに変換
    document.querySelectorAll(".tier-row").forEach(row => {
        const tierName = row.querySelector("h2").textContent.trim();
        const animes = Array.from(row.querySelectorAll(".tier-item img")).map(img => img.customData);
        output[tierName] = animes;
    });

    // markdown作成
    for (const tier in output) {
        if (output[tier].length === 0) continue;
        md += `## ~~~${tier}~~~\n`;
        for (const data of output[tier]) {
            md += `[![${data.title[language]}](${data.imgUrl} "${data.title[language]}")](${data.siteUrl})`;
        }
        md += '\n';
    }
    return md;
}
/**
 * タイアルの見出し部分（ラベル：h2）を作成する関数
 * @param {string} tierName - タイアルの名称
 * @returns {HTMLElement} タイアルラベルの要素
 */
function createTierLabel(tierName) {
    const tierLabel = document.createElement('div');
    tierLabel.className = 'tier-label';
    const h2 = document.createElement('h2');
    h2.contentEditable = 'true';
    h2.textContent = tierName;
    tierLabel.appendChild(h2);
    return tierLabel;
}

/**
 * タイアルの画像表示部分のコンテナを作成する関数
 * @returns {HTMLElement} タイアル画像コンテナの要素
 */
function createTierImages() {
    const tierImages = document.createElement('div');
    tierImages.className = 'tier-images';
    tierImages.innerHTML = '<!-- 画像がここにドラッグ＆ドロップされる -->';
    // ドラッグ＆ドロップのためにSortableを初期化
    Sortable.create(tierImages, { group: "shared", animation: 150 });
    return tierImages;
}

/**
 * 設定ボタンのクリック時の処理（モーダルウィンドウを表示し各種操作を設定）を行う関数
 * @param {HTMLElement} settings - 設定ボタンの要素
 */
function handleSettingsButtonClick(settings) {
    const settingsModal = document.getElementById('settings-modal');
    const deleteRowButton = document.getElementById('delete-row-button');
    const clearRowButton = document.getElementById('clear-row-button');
    const addRowAboveButton = document.getElementById('add-row-above-button');
    const addRowBelowButton = document.getElementById('add-row-below-button');
    const currentRow = settings.closest('.tier-row');

    // 削除ボタンの処理
    deleteRowButton.onclick = () => {
        const imagePool = document.getElementById("imagePool");
        currentRow.querySelectorAll(".tier-item").forEach(item => {
            imagePool.appendChild(item);
        });
        currentRow.remove();
        settingsModal.style.display = 'none';
    };

    // 行クリアボタンの処理
    clearRowButton.onclick = () => {
        const imagePool = document.getElementById("imagePool");
        currentRow.querySelectorAll(".tier-item").forEach(item => {
            imagePool.appendChild(item);
        });
        settingsModal.style.display = 'none';
    };

    // 行の上に新規行追加ボタンの処理
    addRowAboveButton.onclick = () => {
        const tierList = currentRow.parentNode; // 親要素（tier-list）
        const newTierRow = createTierRow("NEW"); // 新しい行を作成
        tierList.insertBefore(newTierRow, currentRow);
        settingsModal.style.display = 'none';
    };

    // 行の下に新規行追加ボタンの処理
    addRowBelowButton.onclick = () => {
        const tierList = currentRow.parentNode;
        const nextRow = currentRow.nextElementSibling;
        const newTierRow = createTierRow("NEW");
        if (nextRow) {
            tierList.insertBefore(newTierRow, nextRow);
        } else {
            tierList.appendChild(newTierRow);
        }
        settingsModal.style.display = 'none';
    };

    // モーダルウィンドウを表示
    settingsModal.style.display = 'flex';
}

/**
 * 設定ボタン自体の要素を作成し、クリック時のイベントを登録する関数
 * @returns {HTMLElement} 設定ボタンの要素
 */
function createSettingsButton() {
    const settings = document.createElement('div');
    settings.className = 'settings fa-solid fa-gear';
    settings.addEventListener('click', () => {
        handleSettingsButtonClick(settings);
    });
    return settings;
}

/**
 * 「上へ移動」「下へ移動」ボタンのコンテナを作成する関数
 * @returns {HTMLElement} 移動ボタン群の要素
 */
function createMoveButtons() {
    const moveButtons = document.createElement('div');
    moveButtons.className = 'move-buttons';

    const moveUp = document.createElement('div');
    moveUp.className = 'move-up fa-solid fa-chevron-up';
    moveUp.addEventListener('click', () => {
        handleMoveUpClick(moveUp);
    });

    const moveDown = document.createElement('div');
    moveDown.className = 'move-down fa-solid fa-chevron-down';
    moveDown.addEventListener('click', () => {
        handleMoveDownClick(moveDown);
    });

    moveButtons.appendChild(moveUp);
    moveButtons.appendChild(moveDown);
    return moveButtons;
}

/**
 * 上移動ボタンのクリックイベント処理
 * @param {HTMLElement} moveUp - 上移動ボタンの要素
 */
function handleMoveUpClick(moveUp) {
    const currentRow = moveUp.closest('.tier-row');
    const previousRow = currentRow.previousElementSibling;
    if (previousRow) {
        const parent = currentRow.parentNode;
        parent.insertBefore(currentRow, previousRow);
        console.log(`Moved row ${currentRow.dataset.tier} above ${previousRow.dataset.tier}`);
    } else {
        console.log('No row above to swap with.');
    }
}

/**
 * 下移動ボタンのクリックイベント処理
 * @param {HTMLElement} moveDown - 下移動ボタンの要素
 */
function handleMoveDownClick(moveDown) {
    const currentRow = moveDown.closest('.tier-row');
    const nextRow = currentRow.nextElementSibling;
    if (nextRow) {
        const parent = currentRow.parentNode;
        parent.insertBefore(nextRow, currentRow);
        console.log(`Moved row ${currentRow.dataset.tier} below ${nextRow.dataset.tier}`);
    } else {
        console.log('No row below to swap with.');
    }
}

/**
 * 設定コントロール（設定ボタン＋移動ボタン）のコンテナを作成する関数
 * @returns {HTMLElement} 設定コントロールの要素
 */
function createSettingsControl() {
    const settingsControl = document.createElement('div');
    settingsControl.className = 'settings-control';

    const settingsButton = createSettingsButton();
    settingsControl.appendChild(settingsButton);

    const moveButtons = createMoveButtons();
    settingsControl.appendChild(moveButtons);

    return settingsControl;
}

/**
 * タイアルの1行（ラベル、画像コンテナ、設定コントロール）を作成するメイン関数
 * @param {string} tierName - タイアルの名称
 * @returns {HTMLElement} 完成したタイアル行の要素
 */
function createTierRow(tierName) {
    // メインのコンテナを作成
    const tierRow = document.createElement('div');
    tierRow.className = 'tier-row';
    tierRow.setAttribute('data-tier', tierName);

    // 各部分の作成
    const tierLabel = createTierLabel(tierName);
    const tierImages = createTierImages();
    const settingsControl = createSettingsControl();

    // 作成した要素を順に追加
    tierRow.appendChild(tierLabel);
    tierRow.appendChild(tierImages);
    tierRow.appendChild(settingsControl);

    return tierRow;
}
async function getSeasonAnimeImageUrl(seasonYear, season, formatType, previous = false) {
    const url = "https://graphql.anilist.co";
    const episodes_greater = 23;
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
                    english
                    romaji
                    native
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
    // 1回当たり50枚までしか取得できないのでそれ以上ある場合は全て取れるまでループを回して取得する
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
                title: media.title,
                imgUrl: media.coverImage["medium"],
            }));

        allImages = allImages.concat(images);
        hasNextPage = pageData.pageInfo.hasNextPage;
        page++;
    }

    return allImages;
}

document.getElementById("fetchButton").addEventListener("click", async () => {

    const seasonYearInput = document.getElementById("seasonYear");
    const seasonSelect = document.getElementById("season");
    const language = document.getElementById("language").value.toLowerCase();

    const optionsArray = Array.from(seasonSelect.options).map(option => option.value);
    const seasonYear = seasonYearInput.value;
    const season = seasonSelect.value;
    const includePreviousSeasonCheckBox = document.getElementById("include-previous-season");
    const noResults = document.getElementById("no-results");
    const imagePool = document.getElementById("imagePool");

    resetTierlist();

    let images = await getSeasonAnimeImageUrl(seasonYear, season, ["TV", "TV_SHORT", "ONA"]);

    // 前記の2クールアニメを含める場合、該当するアニメを追加
    if (includePreviousSeasonCheckBox.checked) {
        const seasonIndex = seasonSelect.selectedIndex;
        const previousSeasonIndex = (seasonIndex - 1 + optionsArray.length) % optionsArray.length;
        const previousSeason = optionsArray[previousSeasonIndex];
        let previousSeasonYear = seasonYear;

        if (seasonIndex === 0) {
            previousSeasonYear -= 1;
        }
        const previousSeasonAnime = await getSeasonAnimeImageUrl(previousSeasonYear, previousSeason, ["TV", "ONA"], true);

        images = [...images, ...previousSeasonAnime];

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
    // 取得した画像データをhtml上に配置
    images.forEach(data => {
        const item = document.createElement("div");
        item.classList.add("tier-item");
        item.setAttribute("draggable", "true");
        item.setAttribute("data-title", data.title[language]);

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
    initialize();

    // Reset Tierlist functionality
    document.getElementById("resetButton").addEventListener("click", resetTierlist);

    // pin images toggle function
    document.getElementById("pin-toggle").addEventListener("click", () => {
        const imageControls = document.getElementById("imageControls");
        const pinToggle = document.getElementById("pin-toggle");

        // classの付け替えでアニメ画像の位置を変更
        imageControls.classList.toggle("image-controls-pin");

        // 下段の余白を追加
        const height = imageControls.offsetHeight; // 要素の実際の高さ(px)
        if (imageControls.classList.contains("image-controls-pin")) {
            pinToggle.innerText = "📌 Unpin Images";
            document.body.style.paddingBottom = height + 'px';
        }
        else {
            pinToggle.innerText = "📌 Pin Images";
            document.body.style.paddingBottom = 0 + 'px';
        }
    });
});

function resetTierlist() {
    const imagePool = document.getElementById("imagePool");
    document.querySelectorAll(".tier-row .tier-item").forEach(item => {
        imagePool.appendChild(item);
    });
}

