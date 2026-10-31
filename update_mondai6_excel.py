# -*- coding: utf-8 -*-
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# Load existing workbook
wb = openpyxl.load_workbook("Tu_Vung_On_Tap_JLPT_N2.xlsx")
ws = wb["Tu_Vung_On_Tap"]

start_stt = ws.max_row  # current max STT + 1
start_row = ws.max_row + 1

# List of vocabulary for Mondai 6 (câu 269 đến 315)
# Format: (vocab, reading, meaning, example, notes, is_correct)
mondai6_vocab = [
    # 269. 掲示
    ("掲示", "けいじ", "Niêm yết, dán thông báo nơi công cộng", "お知らせを掲示板に掲示する (dán thông báo lên bảng tin)", "[Đáp án đúng câu 269] Phương án 4. Dán thông báo nơi đông người qua lại.", True),
    ("掲載", "けいさい", "Đăng tải bài viết trên báo/sách/tạp chí", "雑誌に論文を掲載する (đăng bài báo khoa học lên tạp chí)", "Câu 269-1 dùng sai 掲示, đúng phải là 掲載.", False),
    ("宣伝", "せんでん", "Tuyên truyền, quảng cáo sản phẩm", "テレビで洗剤を宣伝する (quảng cáo bột giặt trên TV)", "Câu 269-2 dùng sai 掲示, đúng phải là 宣伝.", False),
    ("印刷", "いんさつ", "In ấn", "名刺に写真を印刷する (in ảnh lên danh thiếp)", "Câu 269-3 dùng sai 掲示, đúng phải là 印刷/載せる.", False),

    # 270. 快い
    ("快い", "こころよい", "Sẵn lòng, vui vẻ nhận lời; sảng khoái", "急な頼みを快く引き受ける (sẵn lòng nhận lời thỉnh cầu đột xuất)", "[Đáp án đúng câu 270] Phương án 3. Đi với `快く引き受ける/承諾する`.", True),
    ("喜んで", "よろこんで", "Vui vẻ làm gì, sẵn lòng nhận", "喜んでもらっていきます (tôi xin vui vẻ nhận lấy)", "Câu 270-1 dùng sai 快く, đúng phải là 喜んで.", False),
    ("気軽に", "きがるに", "Thoải mái, đừng ngại ngần", "気軽に遊びに来てください (hãy thoải mái ghé chơi nhé)", "Câu 270-2 dùng sai 快く, đúng phải là 気軽に.", False),
    ("素直に", "すなおに", "Thành thật, cởi mở tâm sự", "悩みを素直に打ち明ける (thành thật tâm sự nỗi niềm)", "Câu 270-4 dùng sai 快く, đúng phải là 素直に/気兼ねなく.", False),

    # 271. 分野
    ("分野", "ぶんや", "Lĩnh vực nghiên cứu, học thuật, nghệ thuật", "心理学や言語学の分野 (lĩnh vực tâm lý học và ngôn ngữ học)", "[Đáp án đúng câu 271] Phương án 3. Dùng cho ngành nghề học thuật.", True),
    ("範囲", "はんい", "Phạm vi, mức độ", "保証の範囲を超えた修理 (sửa chữa vượt quá phạm vi bảo hành)", "Câu 271-1 dùng sai 分野, đúng phải là 範囲.", False),
    ("地域", "ちいき", "Khu vực địa lý, vùng đất", "山に近い地域 (vùng/khu vực gần núi)", "Câu 271-2 dùng sai 分野, đúng phải là 地域/地方.", False),
    ("部分", "ぶぶん", "Bộ phận, phần đoạn trong tác phẩm", "小説のこの部分 (đoạn/phần này của cuốn tiểu thuyết)", "Câu 271-4 dùng sai 分野, đúng phải là 部分/箇所.", False),

    # 272. 生き生き
    ("生き生き", "いきいき", "Tràn đầy sức sống, sinh động, hăng say", "サッカーをしているときが一番生き生きしている (lúc đá bóng là lúc tràn đầy sinh khí nhất)", "[Đáp án đúng câu 272] Phương án 3. Tả người đang hoạt động hăng say, rạng rỡ.", True),
    ("元気なうちに", "げんきなうちに", "Khi còn khỏe khoắn", "体が元気なうちに旅行する (đi du lịch khi còn khỏe)", "Câu 272-1 dùng sai 生き生き, đúng phải là 元気なうちに.", False),
    ("元気になる", "げんきになる", "Hồi phục sức khỏe, khỏe lại", "薬を飲んだらだんだん元気になってきた (uống thuốc dần khỏe lại)", "Câu 272-2 dùng sai 生き生き, đúng phải là 元気になってきた.", False),
    ("はっきりしている", "はっきりしている", "Rõ ràng, rành rọt", "記憶がはっきりしている (ký ức còn rất rõ ràng)", "Câu 272-4 dùng sai 生き生き, đúng phải là はっきりしている.", False),

    # 273. 隔てる
    ("隔てる", "へだてる", "Ngăn cách, chia tách không gian/thời gian", "大きな川が二つの市を隔てている (con sông lớn ngăn cách hai thành phố)", "[Đáp án đúng câu 273] Phương án 2. Ngăn cách vật lý ở giữa.", True),
    ("分けて考える", "わけてかんがえる", "Tách bạch, phân định rạch ròi", "二つの問題は分けて考えるべきだ (cần tách riêng 2 vấn đề ra xem xét)", "Câu 273-1 dùng sai 隔てる, đúng phải là 分けて.", False),
    ("間をあける", "あいだをあける", "Dãn cách thời gian / chỗ ngồi", "間をあけて座ってください (xin hãy ngồi cách xa nhau)", "Câu 273-3,4 dùng sai 隔てる, đúng phải là 間をおいて/あけて.", False),

    # 274. 補足
    ("補足", "ほそく", "Bổ sung thông tin cho đầy đủ", "少し説明を補足します (tôi xin bổ sung thêm một chút giải thích)", "[Đáp án đúng câu 274] Phương án 2. Đi với `説明/資料を補足する`.", True),
    ("足す", "たす", "Thêm vào (gia vị, số lượng)", "塩を足しました (nêm thêm chút muối)", "Câu 274-1 dùng sai 補足, đúng phải là 足す/加える.", False),
    ("サポートする", "サポートする", "Hỗ trợ, giúp đỡ công việc", "新入社員の仕事をサポートする (hỗ trợ công việc cho nhân viên mới)", "Câu 274-3 dùng sai 補足, đúng phải là サポートする/手伝う.", False),
    ("置く", "おく", "Đặt để đồ đạc", "家具を置く (bày trí đặt đồ đạc trong phòng)", "Câu 274-4 dùng sai 補足, đúng phải là 置く/配置する.", False),

    # 275. あわただしい
    ("あわただしい", "あわただしい (慌ただしい)", "Tất bật, vội vã, bận rộn hối hả", "昼ご飯も食べずにあわただしく出かけていった (chưa kịp ăn trưa đã tất bật vội vã đi ngay)", "[Đáp án đúng câu 275] Phương án 4. Tả hành động/cuộc sống hối hả.", True),
    ("激しい", "はげしい", "Gay gắt, biến động dữ dội", "気温の変化が激しい (nhiệt độ thay đổi dữ dội)", "Câu 275-1 dùng sai あわただしい, đúng phải là 激しい.", False),
    ("おっちょこちょい", "おっちょこちょい", "Hậu đậu, đãng trí, lơ đễnh", "うっかり屋／おっちょこちょいな人 (người đãng trí hay quên)", "Câu 275-2 tả tính người hay quên, không dùng あわただしい.", False),
    ("急速", "きゅうそく", "Nhanh chóng vượt bậc (phát triển)", "町が急速に発展する (thị trấn phát triển nhanh chóng mặt)", "Câu 275-3 dùng sai, phát triển thì dùng 急速に.", False),

    # 276. かすか
    ("かすか", "かすか (微か)", "Thoang thoảng, mờ nhạt, le lói, loáng thoáng", "遠くに島がかすかに見えてきた (từ xa hòn đảo đã loáng thoáng hiện ra)", "[Đáp án đúng câu 276] Phương án 2. Cảm nhận giác quan mong manh.", True),
    ("わずか", "わずか (僅か)", "Vỏn vẹn, ít ỏi (số lượng tiền bạc)", "財布の中にわずかなお金 (trong ví chỉ còn vỏn vẹn chút tiền)", "Câu 276-1 nói về lượng tiền ít ỏi thì phải dùng わずかな.", False),
    ("短い時間", "みじかいじかん", "Khoảng thời gian ngắn", "短い時間で乾く (khô ráo trong thời gian ngắn)", "Câu 276-3 dùng sai, thời gian thì dùng 短い.", False),
    ("少し", "すこし", "Sớm hơn một chút (sinh nhật)", "誕生日が少し早い (ngày sinh sớm hơn một chút)", "Câu 276-4 dùng sai, sinh nhật thì dùng 少し/わずかに.", False),

    # 277. 催促
    ("催促", "さいそく", "Thúc giục, hối thúc đòi tiền/đòi nợ", "催促の電話がかかってきた (bị gọi điện thoại đòi/thúc giục trả tiền nhà)", "[Đáp án đúng câu 277] Phương án 3. Đi với `家賃/返済の催促`.", True),
    ("促す", "うながす", "Nhắc nhở, khuyến khích làm gì", "注意を促す (nhắc nhở chú ý đề phòng)", "Câu 277-1 dùng sai, nhắc uống nước thì dùng 促す/呼びかける.", False),
    ("促進", "そくしん", "Xúc tiến, thúc đẩy giao lưu", "異文化交流を促進する (thúc đẩy giao lưu văn hóa)", "Câu 277-2 dùng sai, đúng phải là 交流の促進.", False),
    ("そそる", "そそる", "Kích thích, gợi lên (cơn thèm ăn)", "食欲がそそられた (kích thích cảm giác thèm ăn)", "Câu 277-4 dùng sai, đúng là 食欲がそそられる.", False),

    # 278. ものたりない
    ("ものたりない", "ものたりない (物足りない)", "Chưa thỏa mãn, còn thiếu thiếu điều gì đó", "初心者向けのクラスだとものたりなくなってきた (học lớp cơ bản thấy chưa đã/chưa thỏa mãn)", "[Đáp án đúng câu 278] Phương án 1. Cảm giác chưa đủ đô, chưa hài lòng.", True),
    ("寂しい", "さびしい", "Buồn bã, cô đơn hụt hẫng", "みんな寂しく思っています (mọi người đều thấy buồn khi bạn chuyển trường)", "Câu 278-2 bạn chuyển trường thì phải dùng 寂しい.", False),
    ("不自由", "ふじゆう", "Bất tiện, thiếu thốn cơ sở vật chất", "いろいろ不自由でしょう (mới sang chắc còn nhiều thiếu thốn bất tiện)", "Câu 278-3 mới đến sống thì dùng 不自由/不便.", False),
    ("残念", "ざんねん", "Đáng tiếc", "中止だなんて本当に残念だ (bị hủy thì thật là đáng tiếc)", "Câu 278-4 bữa tiệc bị hủy thì dùng 残念.", False),

    # 279. 頑丈
    ("頑丈", "がんじょう", "Chắc chắn, bền chắc, chịu lực tốt (đồ vật)", "このいすはとても頑丈で壊れません (chiếc ghế này rất bền chắc quăng quật không hỏng)", "[Đáp án đúng câu 279] Phương án 3. Tả bàn ghế, thân thể lực lưỡng.", True),
    ("頑固", "がんこ", "Bảo thủ, bướng bỉnh, cứng đầu", "石川さんは頑固で意見を変えない (anh Ishikawa rất cứng đầu không chịu đổi ý)", "Câu 279-1 tính người không đổi ý là 頑固.", False),
    ("厳重", "げんじゅう", "Nghiêm ngặt, cẩn mật", "書類を厳重に管理する (quản lý tài liệu một cách cẩn mật)", "Câu 279-2 bảo mật tài liệu két sắt là 厳重.", False),
    ("強固", "きょうこ", "Vững bền, khăng khít (quan hệ tin cậy)", "強固な信頼関係 (mối quan hệ tin cậy bền chặt)", "Câu 279-4 niềm tin vững chắc dùng 強固/固い.", False),

    # 280. 畳む
    ("畳む", "たたむ", "Gấp, xếp lại (quần áo, ô, chiếu); dẹp tiệm", "上着を小さく畳む (gấp chiếc áo khoác gọn nhỏ lại)", "[Đáp án đúng câu 280] Phương án 2. Gấp quần áo vải vóc.", True),
    ("折る", "おる", "Gấp giấy origami, bẻ gập cành cây", "紙を折って鶴を作った (gấp giấy thành con hạc)", "Câu 280-1 gấp giấy origami chim hạc phải dùng 折る.", False),
    ("束ねる", "たばねる", "Búi tóc, buộc tóc thành lọn", "髪を束ねる (buộc tóc gọn gàng)", "Câu 280-3 buộc tóc dài lên phải dùng 束ねる/結ぶ.", False),
    ("腕を組む", "うでをくむ", "Khoanh tay trước ngực", "腕を組んで考え込む (khoanh tay trầm tư suy nghĩ)", "Câu 280-4 khoanh tay là 腕を組む.", False),

    # 281. 合図
    ("合図", "あいず", "Ám hiệu, hiệu lệnh ra dấu", "スタートの合図で一斉に走り出した (sau hiệu lệnh xuất phát đồng loạt lao về trước)", "[Đáp án đúng câu 281] Phương án 1. Hiệu lệnh bằng còi, cờ, tay.", True),
    ("通知", "つうち", "Thông báo bằng văn bản", "ガス会社から点検の通知があった (có giấy báo kiểm tra của công ty gas)", "Câu 281-2 thông báo công ty là 通知/お知らせ.", False),
    ("足跡", "あしあと", "Dấu chân động vật", "動物の足跡があった (có dấu chân con thú in trên đường)", "Câu 281-3 dấu chân con thú là 足跡/痕跡.", False),
    ("目印", "めじるし", "Dấu mốc, vật đánh dấu ghi nhớ", "目印をつけておく (đánh dấu mốc để khỏi quên)", "Câu 281-4 đánh dấu chỗ gieo hạt là 目印.", False),

    # 282. こつこつ
    ("こつこつ", "こつこつ", "Cần cù, miệt mài, kiên trì từng chút một", "毎日こつこつと勉強してきた (chăm chỉ miệt mài học tập mỗi ngày)", "[Đáp án đúng câu 282] Phương án 4. Đi với `こつこつ勉強する/働く/貯金する`.", True),
    ("だんだん", "だんだん", "Dần dần, từng bước hiểu ra", "だんだんわかってきた (dần dần đã hiểu ra được)", "Câu 282-1 hiểu ra từ từ dùng だんだん/次第に.", False),
    ("少しずつ", "すこしずつ", "Từng chút một (ăn uống)", "熱いから少しずつ食べた (nóng nên ăn từng tí một)", "Câu 282-2 dùng 少しずつ.", False),
    ("ぐんぐん", "ぐんぐん", "Tăng vùn vụt (nhiệt độ)", "気温がぐんぐん上がり始めた (nhiệt độ tăng nhanh vùn vụt)", "Câu 282-3 nhiệt độ tăng nhanh dùng ぐんぐん.", False),

    # 283. 縮む
    ("縮む", "ちぢむ", "Co lại, rút ngắn chiều dài/kích thước", "セーターを洗ったら縮んで着られなくなった (giặt áo len xong bị co lại không mặc vừa)", "[Đáp án đúng câu 283] Phương án 3. Đồ len, vải vóc bị co rút.", True),
    ("つぶれる", "つぶれる", "Bẹp dúm, bẹp rúm do đè nặng", "重さで箱がつぶれた (hộp bị đè bẹp dúm)", "Câu 283-1 hộp giấy bị đè bẹp là つぶれる.", False),
    ("短くなる", "みじかくなる", "Ngắn đi (bút chì)", "鉛筆が短くなった (bút chì đã bị ngắn cũn)", "Câu 283-2 bút chì dùng mòn là 短くなる.", False),
    ("狭くなる", "せまくなる", "Hẹp lại (diện tích sân vườn)", "庭が狭くなった (sân vườn bị hẹp lại)", "Câu 283-4 diện tích đất vườn thu hẹp là 狭くなる.", False),

    # 284. 会見
    ("会見", "かいけん", "Họp báo, tiếp kiến báo giới chính thức", "社長は会見を開き、質問に答えた (giám đốc tổ chức họp báo trả lời báo giới)", "[Đáp án đúng câu 284] Phương án 2. Đi với `記者会見を開く`.", True),
    ("面接", "めんせつ", "Phỏng vấn xin việc làm", "アルバイトの面接がある (có buổi phỏng vấn xin việc làm thêm)", "Câu 284-1 phỏng vấn việc làm là 面接.", False),
    ("再会", "さいかい", "Tái ngộ, gặp lại bạn cũ", "同級生との再会を楽しむ (tận hưởng niềm vui tái ngộ bạn bè cũ)", "Câu 284-3 gặp lại bạn bè sau 10 năm là 再会.", False),
    ("取材", "しゅざい", "Thu thập thông tin, phỏng vấn ghi hình báo chí", "テレビ番組の取材を受けた (được chương trình truyền hình phỏng vấn)", "Câu 284-4 nhận phỏng vấn truyền hình là 取材.", False),

    # 285. 支持
    ("支持", "しじ", "Ủng hộ, tán thành (chính trị gia, chính sách)", "田中市長は市民から多くの支持を集めている (thị trưởng Tanaka nhận được nhiều sự ủng hộ của dân chúng)", "[Đáp án đúng câu 285] Phương án 3. Đi với `支持を集める/支持率`.", True),
    ("応援", "おうえん", "Cổ vũ thể thao", "息子の応援に行く (đi cổ vũ cho con trai đá bóng)", "Câu 285-1 cổ vũ thể thao dùng 応援.", False),
    ("許可", "きょか", "Cấp phép, cho phép chụp ảnh", "撮影の許可を得る (xin được giấy phép chụp hình)", "Câu 285-2 được phép chụp ảnh là 許可.", False),
    ("歓迎", "かんげい", "Hoan nghênh, chào đón nồng nhiệt", "先生方に温かく歓迎された (được các thầy cô chào đón nồng nhiệt)", "Câu 285-4 thầy cô chào đón dùng 歓迎.", False),

    # 286. 妥当
    ("妥当", "だとう", "Hợp lý, thỏa đáng, đúng mực", "妥当な金額だと思う (tôi nghĩ đây là số tiền hợp lý thỏa đáng)", "[Đáp án đúng câu 286] Phương án 1. Đi với `妥当な判断/妥当な金額`.", True),
    ("好都合", "こうつごう", "Thuận tiện, vừa vặn lịch trình", "私には好都合だった (vừa hay lại rất thuận lợi cho tôi)", "Câu 286-2 tiện cho bản thân dùng 好都合/ありがたい.", False),
    ("絶好", "ぜっこう", "Tuyệt vời, cực kỳ lý tưởng (thời tiết)", "絶好の天気になった (thời tiết trở nên tuyệt hảo)", "Câu 286-3 thời tiết đẹp dùng 絶好/うってつけ.", False),
    ("ぴったり", "ぴったり", "Hoàn toàn khớp với tâm trạng", "私の気持ちにぴったりだ (rất khớp với tâm trạng của tôi)", "Câu 286-4 bài hát hợp tâm trạng dùng ぴったり.", False),

    # 287. 言い訳
    ("言い訳", "いいわけ", "Biện hộ, viện cớ, bào chữa lỗi lầm", "仕事で失敗すると必ず言い訳をする (cứ thất bại trong công việc là lại viện cớ bao biện)", "[Đáp án đúng câu 287] Phương án 3. Đi với `言い訳をする` (tiêu cực).", True),
    ("説明", "せつめい", "Giải thích, thuyết minh", "きちんと説明をした (đã giải thích rành mạch rõ ràng)", "Câu 287-1,2 giải thích đề xuất/bài học dùng 説明.", False),
    ("案内", "あんない", "Hướng dẫn khám bệnh", "検査内容について説明/案内してもらった (được bác sĩ giải thích quy trình khám)", "Câu 287-4 giải thích y tế dùng 説明.", False),

    # 288. 手軽
    ("手軽", "てがる", "Đơn giản, tiện lợi, không mất công", "自宅で手軽にできるので人気がある (tiện lợi tập ở nhà không cần dụng cụ nên rất được ưa chuộng)", "[Đáp án đúng câu 288] Phương án 1. Đi với `手軽にできる/手軽な料理`.", True),
    ("簡単", "かんたん", "Đơn giản, ngắn gọn", "簡単な自己紹介 (bài tự giới thiệu ngắn gọn)", "Câu 288-2 tự giới thiệu 1 phút dùng 簡単な/手短な.", False),
    ("略装", "りゃくそう", "Trang phục thường ngày, thoải mái", "カジュアルな服装 (trang phục thoải mái, giản dị)", "Câu 288-3 quần áo tiệc dùng カジュアルな/略装.", False),
    ("容易", "ようい", "Dễ dàng giành chiến thắng", "簡単に勝てる (tưởng là sẽ dễ dàng thắng trận)", "Câu 288-4 thắng trận dùng 簡単に/たやすく.", False),

    # 289. 温暖
    ("温暖", "おんだん", "Ôn hòa, ấm áp (khí hậu thiên nhiên)", "この地方は温暖で暮らしやすい (vùng này khí hậu ôn hòa dễ sống)", "[Đáp án đúng câu 289] Phương án 3. Đi với `温暖な気候/温暖化`.", True),
    ("温厚", "おんこう", "Hiền lành, đôn hậu, hòa nhã (tính cách)", "温厚な性格の人 (người có tính tình đôn hậu hiền hòa)", "Câu 289-1 tính cách con người phải dùng 温厚.", False),
    ("温かい", "あたたかい", "Nóng hổi, ấm nóng (thức ăn)", "温かいうちに召し上がってください (hãy dùng bữa khi đồ ăn còn ấm nóng)", "Câu 289-2 thức ăn ấm nóng dùng 温かい.", False),
    ("暖か", "あたたか", "Ấm áp (nhiệt độ trong phòng)", "部屋の中が暖かくなって (bật điều hòa phòng ấm áp lên)", "Câu 289-4 nhiệt độ phòng dùng 暖かく.", False),

    # 290. 振り向く
    ("振り向く", "ふりむく", "Ngoái đầu lại phía sau; quan tâm đến", "後ろから呼ばれたので振り向いたら、課長だった (nghe gọi đằng sau ngoái đầu lại thì hóa ra là trưởng nhóm)", "[Đáp án đúng câu 290] Phương án 1. Quay đầu nhìn lại phía sau.", True),
    ("左右を見る", "さゆうをみる", "Nhìn trái ngó phải", "左右を確認する (ngó trước nhìn sau xem có xe không)", "Câu 290-2 sang đường nhìn hai bên dùng 左右を見る.", False),
    ("見上げる", "みあげる", "Ngước mắt nhìn lên trên", "空を見上げる (ngước nhìn lên bầu trời)", "Câu 290-3 nhìn lên trời dùng 見上げる.", False),
    ("うつむく", "うつむく", "Cúi gằm mặt xuống đất", "恥ずかしそうにうつむいた (ngượng ngùng cúi gằm mặt xuống)", "Câu 290-4 xấu hổ nhìn xuống dùng うつむく/下を向く.", False),

    # 291. 用途
    ("用途", "ようと", "Công dụng, mục đích sử dụng (đồ vật/tiền)", "本来の用途ではないが、花瓶にしてもいい (dù không phải công dụng gốc nhưng cắm hoa vẫn được)", "[Đáp án đúng câu 291] Phương án 4. Mục đích ứng dụng của vật thể.", True),
    ("使い方", "つかいかた", "Cách phân bổ thời gian", "時間の使い方を工夫する (sắp xếp cách dùng thời gian hợp lý)", "Câu 291-1 thời gian thì dùng 使い方/配分.", False),
    ("役割", "やくわり", "Vai trò, nhiệm vụ được giao", "私の役割は新入社員の指導だ (vai trò của tôi là hướng dẫn người mới)", "Câu 291-2 vai trò con người dùng 役割.", False),
    ("分野", "ぶんや", "Lĩnh vực áp dụng tài năng", "多くの分野で生かされる (tài năng được phát huy ở nhiều lĩnh vực)", "Câu 291-3 tài năng phát huy ở các 分野/場面.", False),

    # 292. 甘やかす
    ("甘やかす", "あまやかす", "Nuông chiều, chiều chuộng quá mức (con cái)", "親に甘やかされて育った (lớn lên trong sự nuông chiều của bố mẹ)", "[Đáp án đúng câu 292] Phương án 2. Chiều chuộng trẻ sinh hư.", True),
    ("易化", "いか", "Làm cho đề thi dễ hơn", "内容が簡単になっている (nội dung đề thi dễ hơn năm ngoái)", "Câu 292-1 đề thi giảm độ khó dùng 易しくなる/簡単になる.", False),
    ("甘く見る", "あまくみる", "Xem nhẹ, coi thường bệnh cảm", "風邪を甘く見ないほうがいい (đừng có xem thường bệnh cảm cúm)", "Câu 292-2 coi nhẹ dùng 甘く見る/油断する.", False),
    ("甘くする", "あまくする", "Làm ngọt nước uống", "コーヒーを甘くした (cho đường làm cà phê ngọt hơn)", "Câu 292-4 nêm ngọt thức uống dùng 甘くする.", False),

    # 293. 行方
    ("行方", "ゆくえ", "Tung tích, dấu vết nơi chốn (người mất tích)", "二人は事件に関係があるが、まだ行方が分からない (hai người dính líu đến vụ án nhưng hiện chưa rõ tung tích)", "[Đáp án đúng câu 293] Phương án 1. Đi với `行方不明/行方が分からない`.", True),
    ("行き先", "いきさき", "Điểm đến của xe buýt/chuyến đi", "行き先を確かめる (xác nhận điểm đến của xe buýt)", "Câu 293-2 điểm đến xe buýt là 行き先.", False),
    ("前方", "ぜんぽう", "Phía trước mặt", "前方に高層ビルが見えた (phía trước mặt hiện ra tòa nhà cao tầng)", "Câu 293-3 hướng nhìn phía trước dùng 前方.", False),
    ("行きつけ", "いきつけ", "Nơi hay lui tới", "行きつけの喫茶店 (quán cà phê quen hay ghé)", "Câu 293-4 nơi quen hay lui tới dùng 行きつけ/行く場所.", False),

    # 294. 作成
    ("作成", "さくせい", "Soạn thảo, lập giấy tờ tài liệu kế hoạch", "会議の資料を作成しておいてください (xin hãy soạn thảo sẵn tài liệu cuộc họp)", "[Đáp án đúng câu 294] Phương án 2. Đi với `書類/資料/計画を作成する`.", True),
    ("作る", "つくる", "Tạo cơ hội giao tiếp", "話す機会を多く作る (tạo thật nhiều cơ hội nói chuyện)", "Câu 294-1 cơ hội dùng 機会を作る/設ける.", False),
    ("生産", "せいさん", "Sản xuất, trồng trọt nông sản", "生産された果物 (trái cây được nuôi trồng sản xuất ở vùng này)", "Câu 294-3 hoa quả nông sản dùng 栽培/生産/収穫.", False),
    ("設立", "せつりつ", "Thành lập công ty", "新しい会社を設立する (thành lập doanh nghiệp mới)", "Câu 294-4 lập công ty dùng 設立/立ち上げる.", False),

    # 295. いったん
    ("いったん", "いったん (一旦)", "Tạm thời một lát; một khi đã...", "会社にいったん戻ったが、すぐにまた出かけた (ghé tạm về công ty một lát rồi lại đi ngay)", "[Đáp án đúng câu 295] Phương án 3. Làm việc gì tạm thời rồi tiếp tục.", True),
    ("一度も", "いちども", "Một lần cũng không (chưa từng đi nước ngoài)", "一度も行ったことがない (chưa từng đi ra nước ngoài lần nào)", "Câu 295-1 chưa đi nước ngoài dùng 一度も.", False),
    ("一度", "いちど", "Chỉ một lần duy nhất", "一度しか会っていない (chỉ mới gặp mặt đúng một lần duy nhất)", "Câu 295-2 gặp 1 lần dùng 一度しか.", False),
    ("一回", "いっかい", "Mỗi tuần một lần", "週に1回映画を見に行った (mỗi tuần đi xem phim 1 lần)", "Câu 295-4 tần suất dùng 週に1回/1度.", False),

    # 296. 思いつく
    ("思いつく", "おもいつく", "Nảy ra ý tưởng, nghĩ ra sáng kiến", "散歩しているときにいいアイディアを思いついた (khi đi dạo tôi đã nảy ra ý tưởng tuyệt hay)", "[Đáp án đúng câu 296] Phương án 2. Đi với `アイディア/計画を思いつく`.", True),
    ("想像する", "そうぞうする", "Mường tượng, hình dung viễn cảnh", "成功している自分の姿を想像する (hình dung bản thân thành đạt sau này)", "Câu 296-1 viễn cảnh tương lai dùng 想像する/思い描く.", False),
    ("予感する", "よかんする", "Linh cảm, cảm thấy", "親友になれそうな気がした (có linh cảm là sẽ trở thành bạn thân)", "Câu 296-2 cảm thấy hợp tính dùng 気がする/直感した.", False),
    ("思い出す", "おもいだす", "Nhớ lại kỷ niệm quá khứ", "学生時代のことを思い出す (nhớ lại thời học sinh)", "Câu 296-4 hồi tưởng chuyện xưa dùng 思い出す.", False),

    # 297. 中断
    ("中断", "ちゅうだん", "Tạm dừng, gián đoạn giữa chừng do sự cố", "雨が強くなって試合が中断されている (mưa lớn nên trận đấu tạm thời bị gián đoạn)", "[Đáp án đúng câu 297] Phương án 4. Đi với `試合/会議が中断する`.", True),
    ("中止", "ちゅうし", "Hủy bỏ hoàn toàn sự kiện", "イベントは中止されることになった (sự kiện đã bị hủy bỏ hoàn toàn)", "Câu 297-1 thiếu người hủy sự kiện dùng 中止.", False),
    ("折れる", "おれる", "Gãy cành cây", "折れた木 (cây khô bị gãy gập)", "Câu 297-2 cây cối dùng 折れた/倒れた.", False),
    ("退職", "たいしょく", "Nghỉ việc chuyển công ty", "会社を辞めて／退職して (nghỉ việc ở công ty hiện tại)", "Câu 297-3 nghỉ việc đổi chỗ làm dùng 辞める/退職する.", False),

    # 298. たくましい
    ("たくましい", "たくましい", "Kiên cường, bất khuất; vạm vỡ", "どんな苦労にも負けずにたくましく生きてきた (bất chấp gian khổ vẫn kiên cường vươn lên sống tốt)", "[Đáp án đúng câu 298] Phương án 1. Sức sống mãnh liệt, kiên cường.", True),
    ("丈夫", "じょうぶ", "Bền dai, chắc chắn (sợi dây)", "もっと丈夫なひも (sợi dây thừng bền chắc hơn)", "Câu 298-2 dây thừng dùng 丈夫な/太い.", False),
    ("豊富", "ほうふ", "Phong phú, dày dạn kinh nghiệm", "仕事の経験が豊富だ (kinh nghiệm công việc phong phú)", "Câu 298-3 kinh nghiệm dùng 豊富/豊か.", False),
    ("強烈", "きょうれつ", "Gay gắt, chói chang (nắng hè)", "日ざしが強くなった (ánh nắng trở nên chói chang gay gắt)", "Câu 298-4 ánh nắng dùng 強い/強烈な.", False),

    # 299. 発達
    ("発達", "はったつ", "Phát triển vượt bậc (giao thông, bão, cơ thể)", "交通が発達したことにより便利になった (giao thông phát triển hiện đại giúp đời sống tiện lợi hơn)", "[Đáp án đúng câu 299] Phương án 2. Đi với `交通/文明/台風が発達する`.", True),
    ("伸びる", "のびる", "Tăng trưởng chiều cao", "身長が伸びて (chiều cao tăng vọt lên)", "Câu 299-1 chiều cao người dùng 伸びる.", False),
    ("向上", "こうじょう", "Nâng cao chất lượng dịch vụ", "サービスの向上に努める (nỗ lực nâng cấp dịch vụ)", "Câu 299-3 dịch vụ dùng 向上/改善.", False),
    ("育ち", "そだち", "Cây cối sinh trưởng tốt tươi", "トマトの育ちが良い (cây cà chua sinh trưởng tươi tốt)", "Câu 299-4 rau củ quả dùng 生育/育ち.", False),

    # 300. きっかけ
    ("きっかけ", "きっかけ", "Cơ duyên, động cơ khởi phát, bước ngoặt", "今回の事件をきっかけに防犯意識が高まった (lấy vụ án lần này làm bước ngoặt nâng cao ý thức phòng chống tội phạm)", "[Đáp án đúng câu 300] Phương án 3. Mẫu ngữ pháp N2: `～をきっかけに`.", True),
    ("機会", "きかい", "Dịp, cơ hội tham dự", "次の機会にはぜひ出席したい (dịp tới nhất định tôi sẽ tham gia)", "Câu 300-1 dịp/cơ hội tham dự dùng 機会/次回.", False),
    ("起源", "きげん", "Nguồn gốc, lai lịch chữ Hán", "漢字の起源／成り立ち (nguồn gốc cấu tạo của chữ Hán)", "Câu 300-2 lịch sử chữ Hán dùng 起源/歴史.", False),
    ("理由", "りゆう", "Lý do phản đối dự án", "反対する理由は (lý do phản đối dự án công trình)", "Câu 300-4 lý do phản đối dùng 理由/原因.", False),

    # 301. 引退
    ("引退", "いんたい", "Giải nghệ, giã từ sự nghiệp thể thao/chính trường", "鈴木選手は去年引退し、海外に移住した (vận động viên Suzuki năm ngoái đã giải nghệ và định cư nước ngoài)", "[Đáp án đúng câu 301] Phương án 3. Vận động viên, nghệ sĩ, chính khách giải nghệ.", True),
    ("辞退", "じたい", "Xin rút lui, từ chối tham gia thi đấu", "スピーチ大会を辞退する (xin rút lui không tham gia cuộc thi diễn thuyết)", "Câu 301-1 rút khỏi cuộc thi dùng 辞退する/欠場する.", False),
    ("辞める", "やめる", "Nghỉ làm thêm", "アルバイトを辞めて (bỏ công việc làm thêm để tập trung học)", "Câu 301-2 nghỉ làm thêm dùng 辞める.", False),
    ("辞退する", "じたいする", "Từ chối lời mời vào công ty", "内定を辞退する (từ chối lời mời làm việc của công ty)", "Câu 301-4 đỗ phỏng vấn nhưng không vào dùng 辞退する.", False),

    # 302. 順調
    ("順調", "じゅんちょう", "Thuận buồm xuôi gió, trôi chảy suôn sẻ", "発売以来、順調に売り上げを伸ばしている (kể từ khi mở bán doanh số đã tăng trưởng rất đều đặn thuận lợi)", "[Đáp án đúng câu 302] Phương án 4. Đi với `順調に進む/順調に伸びる`.", True),
    ("親切", "しんせつ", "Tận tình, kiên nhẫn trả lời", "ていねいに答えてくれる (thầy giáo kiên nhẫn giải đáp tỉ mỉ)", "Câu 302-1 giải đáp thắc mắc dùng ていねいに/的確に.", False),
    ("うまく", "うまく", "Dễ dàng, trơn tru (nuốt thức ăn)", "食べ物をうまく飲み込めない (cổ họng đau không nuốt trôi thức ăn)", "Câu 302-2 nuốt thức ăn dùng うまく/スムーズに.", False),
    ("派手に", "はでに", "Ngã nhào ra đất một cú đau điếng", "派手に転んでしまった (đường trơn ngã nhào ra đất)", "Câu 302-3 trượt chân ngã dùng 派手に/激しく.", False),

    # 303. 生じる
    ("生じる", "しょうじる", "Phát sinh, nảy sinh (vấn đề, hiểu lầm, lỗi)", "習慣の違いから誤解が生じることがある (do khác biệt tập quán nên đôi khi nảy sinh hiểu lầm)", "[Đáp án đúng câu 303] Phương án 1. Đi với `誤解/問題/被害が生じる`.", True),
    ("実る", "みのる", "Đơm hoa kết trái", "果物が実っている (trái cây đơm hoa kết trái trĩu cành)", "Câu 303-2 hoa quả kết trái dùng 実る/栽培される.", False),
    ("生まれる", "うまれる", "Ra đời, phát minh công nghệ mới", "新しい技術が開発された (công nghệ mới được phát minh/ra đời)", "Câu 303-3 công nghệ dùng 誕生した/開発された.", False),
    ("輩出", "はいしゅつ", "Đào tạo, sản sinh ra nhiều nhân tài", "研究者を多く輩出している (trường đại học này sản sinh đào tạo nhiều nhà nghiên cứu)", "Câu 303-4 đào tạo nhân tài dùng 輩出している.", False),

    # 304. 延長
    ("延長", "えんちょう", "Gia hạn thời gian, kéo dài cuộc họp", "会議が1時間延長されることになった (cuộc họp đã được quyết định kéo dài thêm 1 tiếng)", "[Đáp án đúng câu 304] Phương án 3. Đi với `時間を延長する`.", True),
    ("延期", "えんき", "Hoãn dời ngày tổ chức", "出発が三日後に延期された (chuyến đi bị hoãn lùi lại 3 ngày)", "Câu 304-1 hoãn lùi ngày lại dùng 延期された.", False),
    ("増築", "ぞうちく", "Xây thêm tầng, cơi nới nhà cửa", "3階建てに増築する (cơi nới xây thêm tầng 3)", "Câu 304-2 xây thêm tầng nhà dùng 増築する.", False),
    ("乗り越す", "のりこす", "Đi quá ga dự định", "一駅乗り越してしまった (ngủ gật nên đi quá mất một ga)", "Câu 304-4 ngủ quên đi quá ga dùng 乗り越す.", False),

    # 305. さびる
    ("さびる", "さびる (錆びる)", "Bị rỉ sét (kim loại sắt thép)", "鉄の棒がさびて茶色くなっている (thanh sắt để ngoài trời bị rỉ sét ngả màu nâu)", "[Đáp án đúng câu 305] Phương án 4. Kim loại sắt thép bị oxy hóa.", True),
    ("腐る", "くさる", "Ô thiu, hôi thối (thực phẩm)", "生ものが腐って臭くなった (đồ tươi sống bị ôi thiu bốc mùi)", "Câu 305-1 thức ăn ôi thiu dùng 腐る.", False),
    ("濁る", "にごる", "Vẩn đục (nước sông sau mưa)", "川の水が濁っている (nước sông đục ngầu phù sa)", "Câu 305-2 nước sông đục dùng 濁る.", False),
    ("枯れる", "かれる", "Héo úa, tàn lụi (cây cỏ)", "花が枯れてしまった (quên tưới cây nên hoa bị héo rũ)", "Câu 305-3 hoa héo tàn dùng 枯れる.", False),

    # 306. 目上
    ("目上", "めうえ", "Cấp trên, người bề trên, bậc tiền bối", "参加した社員がすべて目上だった (các nhân viên tham gia đều là bậc tiền bối bề trên)", "[Đáp án đúng câu 306] Phương án 1. Người lớn tuổi hoặc có chức vụ cao hơn.", True),
    ("高級", "こうきゅう", "Hàng hóa thượng hạng, cao cấp", "最も高級な商品 (món hàng cao cấp đắt đỏ nhất tiệm)", "Câu 306-2 hàng hóa giá cao dùng 高級な/上位の.", False),
    ("トップ", "トップ", "Dẫn đầu, đứng nhất bảng", "成績はいつもトップだった (thành tích học tập luôn đứng đầu bảng)", "Câu 306-3 thành tích đứng đầu dùng トップ/1位.", False),
    ("素晴らしい", "すばらしい", "Người xuất sắc, tuyệt vời", "本当に優秀な人だ (thực sự là người rất xuất sắc)", "Câu 306-4 khen người tài giỏi dùng 優秀な/偉大な.", False),

    # 307. 大げさ
    ("大げさ", "おおげさ (大袈裟)", "Nói quá, cường điệu, thổi phồng sự việc", "小さなことを大げさに言う (chuyện bé xé ra to, thổi phồng sự việc nhỏ)", "[Đáp án đúng câu 307] Phương án 4. Đi với `大げさに言う/大げさな表現`.", True),
    ("大量に", "たいりょうに", "Thừa mứa rất nhiều (nấu ăn)", "料理がたくさん余ってしまった (nấu quá tay thừa ê hề đồ ăn)", "Câu 307-1 đồ ăn thừa dùng たくさん/大量に.", False),
    ("大幅に", "おおはばに", "Hạ nhiệt độ đáng kể, biên độ lớn", "気温が大幅に下がる (nhiệt độ giảm mạnh đáng kể)", "Câu 307-2 nhiệt độ giảm mạnh dùng 大幅に/急激に.", False),
    ("飛躍的に", "ひやくてきに", "Tiến bộ vượt bậc, ngoạn mục", "成績がぐんと伸びた (thành tích thi cử tiến bộ vượt bậc)", "Câu 307-3 điểm số tăng vọt dùng 飛躍的に/大幅に.", False),

    # 308. 反省
    ("反省", "はんせい", "Kiểm điểm, tự nhìn nhận và ăn năn lỗi lầm", "準備不足で迷惑をかけたことを反省しています (tôi đang tự kiểm điểm sâu sắc vì chuẩn bị chưa chu đáo gây phiền hà)", "[Đáp án đúng câu 308] Phương án 2. Tự suy ngẫm hối lỗi về sai lầm.", True),
    ("思い出す", "おもいだす", "Cố nhớ lại bài thuyết trình", "どんなに思い出そうとしても (dù cố nhớ lại thế nào cũng chịu)", "Câu 308-1 cố nhớ lại trong đầu dùng 思い出す.", False),
    ("懐かしむ", "なつかしむ", "Bồi hồi nhớ lại kỷ niệm xưa", "思い出を懐かしそうに話す (kể lại kỷ niệm với vẻ mặt bồi hồi hoài niệm)", "Câu 308-2 nhớ chuyện xưa dùng 懐かしむ/振り返る.", False),
    ("確認", "かくにん", "Xem lại, kiểm tra lại cách dùng máy", "もう一度最初から確認しておきましょう (hãy kiểm tra lại từ đầu cách thao tác)", "Câu 308-4 kiểm tra máy móc dùng 確認する/おさらいする.", False),

    # 309. 役目
    ("役目", "やくめ", "Bổn phận, trách nhiệm, nhiệm vụ được giao", "部下に仕事を教えるのは課長の役目の一つだ (hướng dẫn công việc cho cấp dưới là một trong những bổn phận của trưởng nhóm)", "[Đáp án đúng câu 309] Phương án 4. Đi với `役目を果たす`.", True),
    ("役", "やく", "Đóng vai bác sĩ trong vở kịch", "医者の役を演じる (hóa thân thủ vai bác sĩ)", "Câu 309-1 vai diễn sân khấu dùng 役.", False),
    ("日課", "にっか", "Thói quen hàng ngày, bài tập mỗi ngày", "毎朝散歩することが日課になっている (đi bộ mỗi sáng đã thành thói quen thường nhật)", "Câu 309-2 thói quen đi bộ hàng ngày dùng 日課.", False),
    ("担当", "たんとう", "Người phụ trách ca trực vệ sinh", "今日の掃除の担当だ (người phụ trách dọn dẹp vệ sinh hôm nay)", "Câu 309-3 phân công trực nhật dùng 担当/係.", False),

    # 310. 最寄り
    ("最寄り", "もより", "Gần nhất (chỉ dùng cho địa điểm giao thông/cơ sở công cộng)", "最寄りの店までは歩いて30分だ (đi bộ tới cửa hàng gần nhất cũng mất 30 phút)", "[Đáp án đúng câu 310] Phương án 1. Đi với `最寄りの駅/バス停/店`.", True),
    ("親しい", "したしい", "Bạn bè thân thiết nhất", "一番親しい友達 (người bạn thân thiết nhất của tôi)", "Câu 310-2 bạn thân dùng 親しい/親友.", False),
    ("直前", "ちょくぜん", "Kỳ thi sắp tới gần", "次の試験／直近の試験 (kỳ thi gần nhất sắp diễn ra)", "Câu 310-3 kỳ thi gần nhất dùng 次の/直近の.", False),
    ("隣の", "となりの", "Người ngồi bên cạnh trên tàu", "隣の人に足を踏まれた (bị người ngồi bên cạnh giẫm vào chân)", "Câu 310-4 người bên cạnh dùng 隣の人.", False),

    # 311. 解約
    ("解約", "かいやく", "Hủy hợp đồng, hủy tài khoản dịch vụ tài chính", "銀行の口座を解約した (đóng/tất toán tài khoản ngân hàng)", "[Đáp án đúng câu 311] Phương án 2. Đi với `携帯／保険／口座を解約する`.", True),
    ("撤回", "てっかい", "Rút lại lời phát ngôn", "昨日の発言を撤回した (bộ trưởng tuyên bố rút lại phát ngôn ngày hôm qua)", "Câu 311-1 rút lại phát biểu dùng 撤回する/取り消す.", False),
    ("キャンセル", "キャンセル", "Hủy cuộc hẹn gặp", "面会の約束をキャンセルした (hủy cuộc gặp gỡ đối tác)", "Câu 311-3 hủy hẹn gặp dùng キャンセル/取りやめ.", False),
    ("解消", "かいしょう", "Xóa bỏ tình trạng thâm hụt tài chính", "赤字を解消することができた (đã xóa bỏ được thâm hụt kinh doanh)", "Câu 311-4 thâm hụt tài chính dùng 赤字を解消する.", False),

    # 312. 演説
    ("演説", "えんぜつ", "Diễn thuyết, hùng biện chính trị trước công chúng", "首相は国会での演説で決意を述べた (thủ tướng bày tỏ quyết tâm trong bài diễn thuyết tại Quốc hội)", "[Đáp án đúng câu 312] Phương án 2. Đi với `街頭演説/国会での演説`.", True),
    ("答辞", "とうじ", "Bài phát biểu tri ân bế giảng", "卒業式での答辞／スピーチ (bài phát biểu chia tay bế giảng của học sinh)", "Câu 312-1 phát biểu tốt nghiệp dùng 挨拶/答辞/スピーチ.", False),
    ("インタビュー", "インタビュー", "Phỏng vấn sau trận đấu thể thao", "試合後のインタビューで (trong cuộc phỏng vấn sau trận đấu)", "Câu 312-2 cầu thủ chia sẻ sau trận đấu dùng インタビュー/コメント.", False),
    ("記者会見", "きしゃかいけん", "Họp báo định hướng kinh doanh", "記者会見で方針を述べた (nêu phương châm trong buổi họp báo)", "Câu 312-4 họp báo công ty dùng 記者会見.", False),

    # 313. きっぱり
    ("きっぱり", "きっぱり", "Dứt khoát, thẳng thừng, kiên quyết (từ chối)", "デートの誘いをきっぱり断った (thẳng thừng từ chối dứt khoát lời mời hẹn hò)", "[Đáp án đúng câu 313] Phương án 3. Đi liền với `きっぱり断る`.", True),
    ("くっきり", "くっきり", "Rõ mồn một, nét căng (tầm nhìn)", "遠くの物もくっきり見える (nhìn thấy rõ mồn một cảnh vật từ xa)", "Câu 313-1 nhìn rõ mồn một dùng くっきり/はっきり.", False),
    ("すっかり", "すっかり", "Hoàn toàn ngấy phát ngán", "すっかり飽きてしまった (hoàn toàn ngấy phát ngán món này)", "Câu 313-2 ngán hoàn toàn dùng すっかり.", False),
    ("さっぱり", "さっぱり", "Hoàn toàn không nhớ ra nổi", "さっぱり思い出せない (hoàn toàn không thể nhớ ra được chút nào)", "Câu 313-4 phủ định hoàn toàn dùng さっぱり/全く.", False),

    # 314. 保存
    ("保存", "ほぞん", "Bảo quản thực phẩm trong tủ lạnh, lưu file máy tính", "この食蘭は必ず冷蔵庫で保存してください (thực phẩm này nhất định phải bảo quản trong tủ lạnh)", "[Đáp án đúng câu 314] Phương án 3. Đi với `食品を保存する/データを保存する`.", True),
    ("貯金", "ちょきん", "Tiết kiệm tiền bạc", "お金を貯金したほうがいい (nên tiết kiệm tiền cho tương lai)", "Câu 314-1 tiền bạc thì dùng 貯金/貯蓄.", False),
    ("確保", "かくほ", "Giữ chỗ ngồi, xí chỗ", "友達の席を確保しておいた (xí sẵn chỗ ngồi cho bạn)", "Câu 314-2 giữ chỗ dùng 確保する/取っておく.", False),
    ("温存", "おんぞん", "Dưỡng sức, giữ gìn thể lực", "体力を温存しないと (nếu không biết giữ sức thì nửa chặng sau sẽ đuối)", "Câu 314-4 thể lực dùng 温存/節約.", False),

    # 315. 鈍い
    ("鈍い", "にぶい", "Chậm chạp, lờ đờ (cử động cơ thể, phản xạ)", "疲れているのか、いつもより動きが鈍い (do mệt mỏi hay sao mà cử động chậm chạp hơn mọi khi)", "[Đáp án đúng câu 315] Phương án 4. Đi với `動き/反応/感覚が鈍い`.", True),
    ("遅い", "おそい", "Chậm chạm (tính toán con số)", "計算がとても遅い (tính toán rất chậm)", "Câu 315-1 tính toán kém/chậm dùng 苦手/遅い.", False),
    ("長く感じられた", "ながくかんじられた", "Thời gian trôi qua cảm giác dài lê thê", "時間がたつのが遅く／長く感じられた (thấy thời gian trôi qua lâu ghê)", "Câu 315-2 thời gian trôi chậm dùng 遅く/長く.", False),
    ("仕事が遅い", "しごとがおそい", "Làm việc chậm rãi nhưng cẩn thận", "彼は仕事が遅いが、その分丁寧だ (anh ấy thao tác chậm nhưng rất cẩn thận)", "Câu 315-3 làm việc chậm dùng 遅い/のろい.", False)
]

thin_border = Border(
    left=Side(style='thin', color='D9D9D9'),
    right=Side(style='thin', color='D9D9D9'),
    top=Side(style='thin', color='D9D9D9'),
    bottom=Side(style='thin', color='D9D9D9')
)

correct_fill = PatternFill(start_color="E2EFDA", end_color="E2EFDA", fill_type="solid")
distractor_alt_fill = PatternFill(start_color="F9FAFB", end_color="F9FAFB", fill_type="solid")
distractor_fill = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")

correct_font = Font(name="Segoe UI", size=10, bold=True, color="276A3C")
regular_font = Font(name="Segoe UI", size=10, color="000000")

current_stt = start_stt
current_row = start_row

for item in mondai6_vocab:
    vocab, reading, meaning, example, notes, is_correct = item
    
    row_values = [current_stt, vocab, reading, meaning, example, notes]
    
    current_fill = correct_fill if is_correct else (distractor_alt_fill if (current_stt % 2 == 0) else distractor_fill)
    current_font = correct_font if is_correct else regular_font
    
    for col_idx, val in enumerate(row_values, 1):
        c = ws.cell(row=current_row, column=col_idx, value=val)
        c.fill = current_fill
        c.font = current_font
        c.border = thin_border
        
        if col_idx == 1:
            c.alignment = Alignment(horizontal="center", vertical="center")
        elif col_idx in [2, 3]:
            c.alignment = Alignment(horizontal="left", vertical="center")
        else:
            c.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
            
    ws.row_dimensions[current_row].height = 24
    current_row += 1
    current_stt += 1

# Update filter range
ws.auto_filter.ref = f"A1:F{current_row - 1}"

wb.save("Tu_Vung_On_Tap_JLPT_N2.xlsx")
print(f"Appended {len(mondai6_vocab)} Mondai 6 vocabulary items! Total items in workbook is now {current_stt - 1}.")
