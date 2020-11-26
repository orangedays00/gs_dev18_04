var firebaseConfig = {
    apiKey: "AIzaSyBNiZd7rPTcFNq0Ce0fHdryhqwDrBwJ3VM",
    authDomain: "chat-14a28.firebaseapp.com",
    databaseURL: "https://chat-14a28.firebaseio.com",
    projectId: "chat-14a28",
    storageBucket: "chat-14a28.appspot.com",
    messagingSenderId: "1039789747068",
    appId: "1:1039789747068:web:87d682ea846b56016092f9"
  };
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

//firebaseのデーターベース（保存させる場所）を使いますよと言うjsのコードを貼り付ける
// xxxxxスクリプトを貼り付ける
const newPostRef = firebase.database().ref();



function search(){
    const obj = document.getElementById('middle_area');
    const idx = obj.selectedIndex;
    // const selectValue = form.middle_area.value;
    const selectValue = obj.options[idx].value;
    const selectText = obj.options[idx].text;
    console.log(selectText)
    console.log(selectValue);
    $.ajax({
        url: `https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=e2dc7185ac78a3fb&large_area=Z011&genre=G013&middle_area=${selectValue}&format=jsonp`,
        type: 'GET',
        dataType: 'jsonp',
        jsonpCallback: 'callback'
    }).done(function(data) {
        // 検索条件をFirebaseに送る
        // newPostRef.push({
        //     searchvalue:`${selectValue}`,
        //     searchtext:`${selectText}`,
        //     searchurl:`https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=e2dc7185ac78a3fb&large_area=Z011&genre=G013&middle_area=${selectValue}&format=jsonp`
        // })
        // console.log(data.results.shop);

        // 結果全てを取得
        let allData = data.results.shop;
        let panelBody = document.getElementById('results');

        // 再検索時に表示をクリアにする
        document.getElementById('results').innerHTML = "";

        // 取得した値について繰り返し処理
        allData.forEach((value,index)=>{
            // console.log(value.genre);
            // console.log(index);

            // カードヘッダー
            let cardHeader = document.createElement('div');
            cardHeader.classList.add('card-header');

            // お店の名前
            let shopName = value.name;
            let h3Name = document.createElement('h3');
            h3Name.classList.add('card-title');
            h3Name.innerHTML = `${shopName}`;


            // 画像共通要素
            let figure = document.createElement('figure');
            figure.classList.add('card-thumbnail');
            // お店の画像(大)
            let shopPhotoL = value.photo.pc.l;
            let img = document.createElement('img');
            img.classList.add('card-image');
            img.setAttribute('src',`${shopPhotoL}`);

            // お気に入り
            let favorite = document.createElement('label');
            favorite.classList.add('like');
            let likeInput = document.createElement('input');
            likeInput.setAttribute('type','checkbox');
            likeInput.setAttribute('id',`favorite${index}`);
            likeInput.setAttribute('onclick','saveData(this.id)');
            let likeI = document.createElement('i');
            likeI.classList.add('material-icons','md-48','heart');
            likeI.textContent = 'favorite';
            let likeDiv = document.createElement('div');
            likeDiv.classList.add('ripple');
            favorite.appendChild(likeInput);
            favorite.appendChild(likeI);
            favorite.appendChild(likeDiv);

            // ヘッダー統合
            figure.appendChild(img);
            cardHeader.appendChild(h3Name);
            cardHeader.appendChild(figure);
            cardHeader.appendChild(favorite);

            // カードボディ
            let cardBody = document.createElement('div');
            cardBody.classList.add('card-body');

            // お店のキャッチコピー
            let genreCatch = value.genre.catch;
            let pCatch = document.createElement('p');
            pCatch.classList.add('card-text');
            pCatch.textContent = `${genreCatch}`;

            // 住所
            let shopAddress = value.address;
            let pAddress = document.createElement('p');
            pAddress.classList.add('card-text','card-text--address')
            pAddress.textContent = `${shopAddress}`;

            // お店のURL
            let shopUrl = value.urls.pc;
            let aUrl = document.createElement('a');
            aUrl.setAttribute('href',`${shopUrl}`);
            aUrl.setAttribute('target','_blank');

            // ラーメンDB検索
            let ramenDbDiv = document.createElement('div');
            let ramenDbA = document.createElement('a');
            ramenDbDiv.classList.add('card-db');
            ramenDbA.innerHTML = 'ラーメンDBをみる';
            ramenDbA.classList.add('card-db--link');
            ramenDbA.setAttribute('href',`https://ramendb.supleks.jp/search?q=${value.name}&state=tokyo&city=&order=point`);
            ramenDbA.setAttribute('target','_blank');
            ramenDbDiv.appendChild(ramenDbA);

            // カードボディの統合
            cardBody.appendChild(pCatch);
            cardBody.appendChild(pAddress);
            cardBody.appendChild(ramenDbDiv);

            // カードの全体の統合
            let article = document.createElement('article');
            article.classList.add('card');
            article.setAttribute('id',`saveValue${index}`);

            aUrl.appendChild(cardHeader);
            aUrl.appendChild(cardBody);
            article.appendChild(aUrl);

            panelBody.appendChild(article);
        });
    }).fail(function(data) {
        console.log(data);
    });
}

// 気になるお店に登録
function saveData(ele){
    const saveId = ele;
    const saveIndex = saveId.indexOf('e');
    const saveNumber = saveId.slice(saveIndex + 1);
    const saveShopName = document.querySelector(`#saveValue${saveNumber} h3`).textContent;
    const saveShopUrl = document.querySelector(`#saveValue${saveNumber} a`).href;
    const checkInput = document.getElementById(`favorite${saveNumber}`);
    console.log(saveShopUrl);
    console.log(saveShopName);
    if(checkInput.checked){
        newPostRef.push({
            shopName:saveShopName,
            shopUrl:saveShopUrl
        })
    }
}


// 気になる一覧に登録した内容を表示
function favoriteList(){
    newPostRef.on("child_added", function (data) {
        // 全てのデータを取得する。
        let value = data.val();
        let key = data.key;
        // console.log(value);

        let valueDiv = document.createElement('div');
        valueDiv.classList.add("favorite-list");
        let valueA = document.createElement('a');
        valueA.setAttribute('href',`${value.shopUrl}`);
        valueA.setAttribute('target','_blank');
        valueA.classList.add('favorite-text');
        valueA.textContent = `${value.shopName}`;
        let valueDeleteBtn = document.createElement('button');
        valueDeleteBtn.setAttribute('onclick',`deleteFavorite("${key}")`);
        valueDeleteBtn.classList.add('delete-btn');
        valueDeleteBtn.textContent = "削除"

        valueDiv.appendChild(valueA);
        valueDiv.appendChild(valueDeleteBtn);
        document.getElementById('favoriteBody').appendChild(valueDiv);
    });
}

// 画面を読み込み時に、気になるお店を表示
window.onload = function(){
    favoriteList();
}

// 気になるお店一覧から削除する場合
function deleteFavorite(ele){
    newPostRef.child(ele).remove();
    // 削除した場合の表示更新
    document.getElementById('favoriteBody').innerHTML = "";
    favoriteList();
}

document.getElementById('firstDisabled').addEventListener('click',()=>{
    document.querySelector('.first').classList.add('disabled');
    document.querySelector('.first').classList.remove('first');
    document.querySelector('.container').classList.remove('disabled');
    document.querySelector('.container').classList.add('animate__animated','animate__fadeInDown');
    document.querySelector('body').style.width = '1200px';
});