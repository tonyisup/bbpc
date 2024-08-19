import { type FC } from "react";

export const ListenHere: FC = () => {
	const stylePatreonLogo = {
		width: "40px"
	}
	const stylePatreonWordmark = {
		width: "200px"
	}
  const styleImgApple = {
    borderRadius: "13px",
    width: "250px",
    height: "83px",
  }
  const styleAApple = {
    display: "inline-block",
    overflow: "hidden",
    borderRadius: "13px",
    width: "250px",
    height: "83px",
  }
  return <div className="flex gap-4 pb-4 justify-center items-center flex-wrap">
    <div>
      <a target="_blank" rel="noreferrer noopener" className="flex items-center"
        href="https://www.patreon.com/badboyspodcast"
      >
        <img
          src="PATREON_SYMBOL_1_WHITE_RGB.png"
          alt="Patreon"
          style={stylePatreonLogo}
        />
        <img
          src="PATREON_WORDMARK_1_BLACK_RGB.svg"
          alt="Patreon"
          style={stylePatreonWordmark}
        />
      </a>
    </div>
    <div>
      <a target="_blank" rel="noreferrer noopener"
        href="https://podcasts.apple.com/us/podcast/bad-boys-podcast/id937655279?itsct=podcast_box_badge&amp;itscg=30200&amp;ls=1"
        style={styleAApple}
      >
        <img
          src="https://tools.applemediaservices.com/api/badges/listen-on-apple-podcasts/standard-white/en-us?size=250x83&amp;releaseDate=1568907180&h=46e91b7c640e1dbfd6effb144fb212f7"
          alt="Listen on Apple Podcasts" 
          style={styleImgApple}
        />
      </a>
    </div>
    <div>
      <a target="_blank" rel="noreferrer noopener" href="https://soundcloud.com/badboyspodcast">
        Listen on <img alt="Listen on soundcloud" src="https://a-v2.sndcdn.com/assets/images/brand-1b72dd82.svg" /> Soundcloud
      </a>
    </div>
    <div>
      <a target="_blank" rel="noreferrer noopener" href="https://open.spotify.com/show/7kNwGU5aJhw4IZ7x7V6jsl">
        <svg width="165px" height="40px" viewBox="0 0 165 40" version="1.1" xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink">
          <title>spotify-podcast-badge-blk-grn-165x40</title>
          <desc>Created with Sketch.</desc>
          <g id="spotify-podcast-badge-blk-grn-165x40" stroke="none" strokeWidth="1" fill="none"
            fillRule="evenodd">
            <g id="Group-2">
              <path
                d="M155.462317,0.5 L9.54298794,0.5 C9.23718907,0.500000061 9.10222971,0.500057382 8.9333245,0.500344823 C8.75914935,0.500641232 8.60147796,0.501164881 8.4503371,0.501990385 C8.31093757,0.503042293 8.31093757,0.503042293 8.17123664,0.504701114 C8.05145483,0.50622126 7.95430604,0.507728185 7.73523354,0.511324656 C7.63560663,0.512955798 7.63560663,0.512955798 7.53999468,0.514444796 C6.77532204,0.533501958 6.17590622,0.582235722 5.60805245,0.683921078 C4.97373089,0.794883016 4.40022513,0.982751407 3.84712442,1.26350199 C3.29467346,1.54621893 2.78971907,1.91364998 2.350874,2.35265774 C1.9136357,2.78495239 1.54752652,3.28900419 1.26513746,3.84593553 C0.985573621,4.39236294 0.798895233,4.96583863 0.686361558,5.611175 C0.583694388,6.17433335 0.534557489,6.76869157 0.514887789,7.53850954 C0.510904757,7.67113311 0.508296788,7.80771984 0.505899647,7.99045837 C0.50486648,8.07179097 0.50486648,8.07179097 0.503895865,8.15352806 C0.502129327,8.30229721 0.502129327,8.30229721 0.5,8.4443 C0.5,8.98825 0.5,8.98825 0.5,9.5361 L0.5,30.4648 C0.5,30.904206 0.5,30.904206 0.5,31.3385814 C0.5,31.4485499 0.5,31.4485499 0.499937643,31.5507036 C0.502129454,31.7019465 0.502129454,31.7019465 0.503895689,31.8505134 C0.504852178,31.9308028 0.504852178,31.9308028 0.505868535,32.0105901 C0.508268666,32.1932042 0.510882868,32.330397 0.514950025,32.46773 C0.53455833,33.2352268 0.583696518,33.8295783 0.687037849,34.3965174 C0.799275611,35.040243 0.986350407,35.6158457 1.26553381,36.1597408 C1.54826938,36.7147517 1.914868,37.2179189 2.35426946,37.6489326 C2.78903353,38.087359 3.2925666,38.4535299 3.84733733,38.734707 C4.39339648,39.0144827 4.96441014,39.2017457 5.61010376,39.3183422 C6.16895541,39.4185036 6.75381439,39.4656174 7.53852502,39.4874207 C7.85797197,39.4944423 8.15615495,39.498 8.44996762,39.4980075 C8.60147796,39.4988351 8.75914935,39.4993588 8.9333245,39.4996552 C9.10222971,39.4999426 9.23718907,39.4999999 9.54298794,39.5 L155.462417,39.5 C155.732811,39.5 155.853496,39.4999583 156.004198,39.4997505 C156.203248,39.499476 156.378467,39.4989313 156.547359,39.498 C156.839864,39.498 157.147833,39.4943606 157.45627,39.4874902 C158.246626,39.4656826 158.829251,39.4186451 159.383,39.3184485 C160.029195,39.2018314 160.602236,39.01452 161.155288,38.7338785 C161.707735,38.4533688 162.211183,38.0870066 162.649415,37.6447625 C163.081256,37.2194537 163.449134,36.7156181 163.736761,36.1609378 C164.015456,35.6102074 164.202464,35.0320689 164.310967,34.3909277 C164.412834,33.8435049 164.459672,33.2868196 164.488329,32.4742169 C164.490132,32.3308112 164.491187,32.1827793 164.491715,32.0155813 C164.492114,31.8894402 164.492193,31.7888194 164.492309,31.5478582 C164.494473,31.439896 164.494473,31.439896 164.49608,31.3317328 C164.499348,31.0931827 164.5,30.9019181 164.5,30.4648 L164.5,9.5361 C164.5,8.99184779 164.498715,8.7523562 164.492193,8.4443 C164.492193,8.2144775 164.492112,8.1126965 164.491708,7.98543854 C164.491176,7.81794208 164.49012,7.67034488 164.488598,7.54094437 C164.459672,6.71708606 164.412834,6.16037793 164.30953,5.60477958 C164.202818,4.97382724 164.016273,4.39803029 163.738554,3.8473707 C163.450094,3.28832338 163.082566,2.78338505 162.646527,2.35037068 C162.210469,1.91386133 161.705543,1.54618981 161.157075,1.26502432 C160.595147,0.98252524 160.019849,0.794680145 159.382845,0.683323671 C158.822393,0.581999014 158.225384,0.533353753 157.462028,0.514435472 C157.37409,0.513008314 157.37409,0.513008314 157.285869,0.511551041 C157.143548,0.509206314 157.143548,0.509206314 157.001224,0.507006454 C156.826438,0.504389215 156.681281,0.502689027 156.544858,0.501793744 C156.379942,0.500968735 156.206042,0.50047943 156.008899,0.500230522 C155.73508,0.500000033 155.73508,0.500000033 155.462317,0.5 Z"
                id="Path" stroke="#222326" fill="#000000"></path>
              <path
                d="M89.3474827,18.6666318 C89.8655834,18.9767175 90.5368956,18.8045568 90.8449931,18.2823221 C91.1529511,17.7609293 90.9825765,17.086458 90.4630805,16.7763724 C86.1268307,14.1880695 79.2652415,13.9447715 75.1375994,15.2046171 C74.5597769,15.3811274 74.2340977,15.994704 74.4090771,16.5755884 C74.5840564,17.1561922 75.19467,17.4839569 75.7720738,17.3078675 C79.3678011,16.2105012 85.5808227,16.4173185 89.3474827,18.6666318 Z M89.2241321,21.9981581 C89.4874383,21.5679669 89.3526456,21.0039197 88.9244067,20.7387334 C85.317656,18.5099053 80.0417645,17.8827186 75.7976091,19.1776417 C75.3167648,19.3249675 75.0449469,19.8356967 75.1902048,20.320188 C75.3364395,20.803697 75.8453307,21.0768811 76.3271518,20.9305375 C80.0423227,19.7965502 84.8308117,20.3587733 87.9710904,22.2998251 C88.3993293,22.5644502 88.9599887,22.4293314 89.2241321,21.9981581 Z M87.7942971,25.1976523 C88.0043002,24.8524892 87.8961591,24.4013918 87.5527587,24.1905055 C84.4727599,22.298001 80.6544712,21.8575672 76.203243,22.8808497 C75.8104465,22.9707886 75.5656987,23.363517 75.6555605,23.7576484 C75.7450037,24.1516395 76.1355676,24.3987259 76.5275268,24.3083661 C80.5950285,23.3740402 84.0488467,23.7549825 86.7929801,25.4413712 C87.1359618,25.6523978 87.5844336,25.5437977 87.7942971,25.1976523 Z M82.4353811,8.25 C88.8891039,8.25 94.1206227,13.5105113 94.1206227,19.9998597 C94.1206227,26.489629 88.8891039,31.75 82.4353811,31.75 C75.9817979,31.75 70.75,26.489629 70.75,19.9998597 C70.75,13.5105113 75.9817979,8.25 82.4353811,8.25 Z M102.541677,19.0972439 C104.999759,19.698333 106.002193,20.6313961 106.002193,22.3184863 C106.002193,24.31468 104.485287,25.604552 102.137857,25.604552 C100.478484,25.604552 98.9409261,25.011601 97.6905356,23.8892594 C97.637093,23.8418345 97.6312324,23.7598934 97.6775587,23.7050321 L98.7821331,22.3831693 C98.8047381,22.3558088 98.8372502,22.3392522 98.8726926,22.3363057 C98.9064605,22.3343414 98.9430192,22.345005 98.9696707,22.3680158 C100.044245,23.3037448 101.004956,23.7026468 102.182509,23.7026468 C103.24285,23.7026468 103.901743,23.2413067 103.901743,22.4992059 C103.901743,21.8293648 103.575924,21.4548768 101.645291,21.0077081 C99.376979,20.4564292 98.0643551,19.7422501 98.0643551,17.7252905 C98.0643551,15.8444318 99.5860054,14.5298652 101.764456,14.5298652 C103.246059,14.5298652 104.513613,14.9714215 105.639257,15.8796496 C105.693816,15.9237071 105.70484,16.002842 105.664374,16.0603692 L104.679243,17.4567367 C104.658452,17.4862018 104.627335,17.5055646 104.592032,17.5108964 C104.55673,17.5165088 104.520869,17.5079499 104.492264,17.4864825 C103.546343,16.7773545 102.644376,16.4328929 101.734595,16.4328929 C100.79607,16.4328929 100.164805,16.8863756 100.164805,17.5605663 C100.164805,18.2739035 100.524112,18.6134543 102.541677,19.0972439 Z M113.017133,21.3583434 C113.017133,19.9566441 112.124376,18.9396756 110.894916,18.9396756 C109.659595,18.9396756 108.727768,19.9790938 108.727768,21.3583434 C108.727768,22.7377333 109.659595,23.7770112 110.894916,23.7770112 C112.144469,23.7770112 113.017133,22.7829132 113.017133,21.3583434 Z M111.313108,17.09642 C113.203694,17.09642 115.117583,18.5602767 115.117583,21.3583434 C115.117583,24.1558488 113.203694,25.6192846 111.313108,25.6192846 C110.295884,25.6192846 109.461174,25.2398857 108.772838,24.4631283 L108.772838,27.7228156 C108.772838,27.7961979 108.713674,27.8559701 108.640697,27.8559701 L106.834251,27.8559701 C106.761274,27.8559701 106.70225,27.7961979 106.70225,27.7228156 L106.70225,17.3957017 C106.70225,17.3223195 106.761274,17.2625473 106.834251,17.2625473 L108.640697,17.2625473 C108.713674,17.2625473 108.772838,17.3223195 108.772838,17.3957017 L108.772838,18.3251167 C109.461034,17.499391 110.295605,17.09642 111.313108,17.09642 Z M120.023422,23.7918841 C121.330883,23.7918841 122.279874,22.7816504 122.279874,21.3887907 C122.279874,20.0005612 121.296976,18.9542678 119.993561,18.9542678 C118.694612,18.9542678 117.75204,19.9653434 117.75204,21.3583434 C117.75204,22.7455907 118.72838,23.7918841 120.023422,23.7918841 Z M120.023422,17.09642 C122.450109,17.09642 124.350323,18.9684392 124.350323,21.3583434 C124.350323,23.7562453 122.436992,25.6351397 119.993561,25.6351397 C117.575526,25.6351397 115.681172,23.7697151 115.681172,21.3887907 C115.681172,18.9816283 117.588642,17.09642 120.023422,17.09642 Z M129.549748,17.2625473 C129.622726,17.2625473 129.681471,17.3223195 129.681471,17.3957017 L129.681471,18.9569337 C129.681471,19.0301757 129.622726,19.0899478 129.549748,19.0899478 L127.561766,19.0899478 L127.561766,22.8450706 C127.561766,23.438162 127.820467,23.7026468 128.399964,23.7026468 C128.776016,23.7026468 129.112439,23.6214072 129.460445,23.4453178 C129.500771,23.4252535 129.549748,23.4265162 129.589098,23.4513512 C129.628028,23.4754845 129.651889,23.5187001 129.651889,23.5645815 L129.651889,25.0513088 C129.651889,25.0987336 129.626214,25.1433523 129.585051,25.1665035 C129.078392,25.4554022 128.540757,25.5899598 127.892747,25.5899598 C126.299096,25.5899598 125.491037,24.7622697 125.491037,23.1297601 L125.491037,19.0899478 L124.62242,19.0899478 C124.549582,19.0899478 124.490837,19.0301757 124.490837,18.9569337 L124.490837,17.3957017 C124.490837,17.3223195 124.549582,17.2625473 124.62242,17.2625473 L125.491037,17.2625473 L125.491037,15.2187884 C125.491037,15.1454062 125.55048,15.0857743 125.623597,15.0857743 L127.429903,15.0857743 C127.502881,15.0857743 127.561766,15.1454062 127.561766,15.2187884 L127.561766,17.2625473 L129.549748,17.2625473 Z M136.475943,17.270545 L139.562081,17.270545 C139.61692,17.270545 139.666176,17.3045001 139.685432,17.3561342 L141.795649,22.893197 L143.722236,17.3597823 C143.740655,17.3064644 143.791167,17.270545 143.8474,17.270545 L145.728079,17.270545 C145.771894,17.270545 145.811941,17.2922931 145.836778,17.3282125 C145.861756,17.3646932 145.86636,17.4108552 145.850732,17.4518258 L142.716593,25.5954319 C142.06649,27.2763485 141.329177,27.9012903 139.995204,27.9012903 C139.28217,27.9012903 138.705046,27.7527017 138.065827,27.404592 C138.00471,27.3714788 137.979872,27.2965531 138.009035,27.232712 L138.621323,25.8819454 C138.635975,25.8481306 138.664999,25.8224538 138.699464,25.8101065 C138.734348,25.7993026 138.772442,25.8022491 138.804675,25.8200685 C139.147378,26.0086455 139.482545,26.1041968 139.800829,26.1041968 C140.194602,26.1041968 140.483025,25.9739889 140.776332,25.3194416 L138.192526,19.0899478 L136.505804,19.0899478 L136.505804,25.3211253 C136.505804,25.3945076 136.446361,25.4541395 136.373383,25.4541395 L134.566938,25.4541395 C134.4941,25.4541395 134.435215,25.3945076 134.435215,25.3211253 L134.435215,19.0899478 L133.567296,19.0899478 C133.494457,19.0899478 133.434736,19.0301757 133.434736,18.9569337 L133.434736,17.387704 C133.434736,17.3144621 133.494457,17.2546899 133.567296,17.2546899 L134.435215,17.2546899 L134.435215,16.8702399 C134.435215,15.0836697 135.317089,14.1388206 136.985811,14.1388206 C137.671496,14.1388206 138.129456,14.2488238 138.487368,14.3557402 C138.543322,14.3729983 138.580718,14.4249131 138.580718,14.4832822 L138.580718,16.0140668 C138.580718,16.0567212 138.561044,16.0969902 138.526159,16.1221057 C138.492252,16.1472213 138.448716,16.1538158 138.406995,16.1406267 C138.068199,16.0269754 137.765683,15.9517691 137.389073,15.9517691 C136.757529,15.9517691 136.475943,16.2810772 136.475943,17.01953 L136.475943,17.270545 Z M132.460628,17.2625473 C132.533467,17.2625473 132.592909,17.3223195 132.592909,17.3957017 L132.592909,25.3211253 C132.592909,25.3945076 132.533467,25.4541395 132.460628,25.4541395 L130.654044,25.4541395 C130.581066,25.4541395 130.521763,25.3945076 130.521763,25.3211253 L130.521763,17.3957017 C130.521763,17.3223195 130.581066,17.2625473 130.654044,17.2625473 L132.460628,17.2625473 Z M131.566476,13.6539084 C132.281881,13.6539084 132.862076,14.2366168 132.862076,14.956268 C132.862076,15.6761998 132.281881,16.2594694 131.566476,16.2594694 C130.85093,16.2594694 130.270038,15.6761998 130.270038,14.956268 C130.270038,14.2366168 130.85093,13.6539084 131.566476,13.6539084 Z M147.466988,18.0509505 L147.136007,18.0509505 L147.136007,18.475389 L147.466988,18.475389 C147.6322,18.475389 147.730853,18.3941494 147.730853,18.2629593 C147.730853,18.124894 147.6322,18.0509505 147.466988,18.0509505 Z M147.681596,18.6563892 L148.041183,19.1626285 L147.737969,19.1626285 L147.414243,18.698342 L147.136007,18.698342 L147.136007,19.1626285 L146.882189,19.1626285 L146.882189,17.8208417 L147.477314,17.8208417 C147.787226,17.8208417 147.991229,17.9802342 147.991229,18.248788 C147.991229,18.4687944 147.864808,18.6032116 147.681596,18.6563892 Z M147.399732,17.3742343 C146.748513,17.3742343 146.255668,17.8947852 146.255668,18.5322146 C146.255668,19.1692231 146.745024,19.6828989 147.393034,19.6828989 C148.044113,19.6828989 148.537376,19.1626285 148.537376,18.5249185 C148.537376,17.8877697 148.047741,17.3742343 147.399732,17.3742343 Z M147.393034,19.8107215 C146.678047,19.8107215 146.121713,19.2333449 146.121713,18.5322146 C146.121713,17.8309441 146.685303,17.2471132 147.399732,17.2471132 C148.114579,17.2471132 148.671053,17.8243495 148.671053,18.5249185 C148.671053,19.2260487 148.107882,19.8107215 147.393034,19.8107215 Z"
                id="Combined-Shape" fill="#1ED760"></path>
              <path
                d="M19.609,22.904 L15.75,22.904 L15.75,16.8775 L16.923,16.8775 L16.923,21.782 L19.609,21.782 L19.609,22.904 Z M22.406419,22.904 L21.216419,22.904 L21.216419,16.8775 L22.406419,16.8775 L22.406419,22.904 Z M28.6378379,18.314 L27.5838379,18.637 C27.5243379,18.3055 27.2523379,17.787 26.4873379,17.787 C25.9178379,17.787 25.5438379,18.1525 25.5438379,18.552 C25.5438379,18.8835 25.7563379,19.147 26.1983379,19.232 L27.0398379,19.3935 C28.1363379,19.606 28.7228379,20.32 28.7228379,21.17 C28.7228379,22.0965 27.9493379,23.0315 26.5468379,23.0315 C24.9488379,23.0315 24.2433379,22.003 24.1498379,21.1445 L25.2378379,20.8555 C25.2888379,21.4505 25.7053379,21.986 26.5553379,21.986 C27.1843379,21.986 27.5328379,21.6715 27.5328379,21.2465 C27.5328379,20.898 27.2693379,20.626 26.8018379,20.5325 L25.9603379,20.3625 C24.9998379,20.167 24.3793379,19.5465 24.3793379,18.637 C24.3793379,17.566 25.3398379,16.75 26.4788379,16.75 C27.9408379,16.75 28.5018379,17.634 28.6378379,18.314 Z M34.9882569,17.991 L33.0842569,17.991 L33.0842569,22.904 L31.9027569,22.904 L31.9027569,17.991 L29.9987569,17.991 L29.9987569,16.8775 L34.9882569,16.8775 L34.9882569,17.991 Z M40.3696759,22.904 L36.5956759,22.904 L36.5956759,16.8775 L40.3696759,16.8775 L40.3696759,17.9825 L37.7686759,17.9825 L37.7686759,19.3595 L40.1231759,19.3595 L40.1231759,20.405 L37.7686759,20.405 L37.7686759,21.799 L40.3696759,21.799 L40.3696759,22.904 Z M47.4170948,22.904 L46.1845948,22.904 L43.4475948,18.6285 L43.4475948,22.904 L42.2745948,22.904 L42.2745948,16.8775 L43.7365948,16.8775 L46.2440948,20.864 L46.2440948,16.8775 L47.4170948,16.8775 L47.4170948,22.904 Z M53.1054328,19.8865 C53.1054328,21.2465 54.0574328,21.8925 54.9839328,21.8925 C55.9189328,21.8925 56.8709328,21.2465 56.8709328,19.8865 C56.8709328,18.5265 55.9189328,17.8805 54.9839328,17.8805 C54.0574328,17.8805 53.1054328,18.5265 53.1054328,19.8865 Z M51.8899328,19.895 C51.8899328,17.9485 53.3519328,16.75 54.9839328,16.75 C56.6244328,16.75 58.0864328,17.9485 58.0864328,19.895 C58.0864328,21.833 56.6244328,23.0315 54.9839328,23.0315 C53.3519328,23.0315 51.8899328,21.833 51.8899328,19.895 Z M65.0488517,22.904 L63.8163517,22.904 L61.0793517,18.6285 L61.0793517,22.904 L59.9063517,22.904 L59.9063517,16.8775 L61.3683517,16.8775 L63.8758517,20.864 L63.8758517,16.8775 L65.0488517,16.8775 L65.0488517,22.904 Z"
                id="LISTEN-ON" fill="#FFFFFF"></path>
            </g>
          </g>
        </svg>
      </a>
    </div>
    <div>
      <a target="_blank" rel="noreferrer noopener"
        href="https://music.youtube.com/playlist?list=PL5tJGBZ94i2eX66kGUk1dO1SxZiWC5J95">
        <img 
          src="ListenonYouTubeMusic-black-SVG.svg"
          width="150" height="38" alt="Listen on Google Podcasts"
        />
      </a>
    </div>
  </div>
};