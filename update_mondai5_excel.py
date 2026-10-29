# -*- coding: utf-8 -*-
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# Load existing workbook
wb = openpyxl.load_workbook("Tu_Vung_On_Tap_JLPT_N2.xlsx")
ws = wb["Tu_Vung_On_Tap"]

# Find current max STT and max row
start_stt = 213
start_row = ws.max_row + 1

# List of vocabulary for Mondai 5 (câu 219 đến 268)
# Format: (vocab, reading, meaning, example, notes, is_correct)
mondai5_vocab = [
    # 219
    ("済ます", "すます", "Hoàn thành, làm xong, kết thúc", "できるだけ早く仕事を済ます (cố gắng làm xong việc càng sớm càng tốt)", "[Từ gạch chân câu 219] Đồng nghĩa với 終える.", True),
    ("覚える", "おぼえる", "Ghi nhớ, học thuộc; cảm thấy", "単語を暗記して覚える (học thuộc từ vựng)", "Ghi nhớ vào đầu.", False),
    ("終える", "おえる", "Kết thúc, hoàn thành việc gì", "今日の仕事を無事に終える (hoàn thành công việc hôm nay an toàn)", "[Đáp án đúng câu 219] = 済ます.", True),
    ("始める", "はじめる", "Bắt đầu làm việc gì", "新しい趣味を始める (bắt đầu một sở thích mới)", "Khởi đầu một hành động.", False),
    ("教える", "おしえる", "Dạy học, chỉ dẫn, nói cho biết", "駅への道を教える (chỉ đường ra ga)", "Cung cấp kiến thức hoặc thông tin.", False),

    # 220
    ("あいまい", "あいまい (曖昧)", "Mơ hồ, mập mờ, không rõ ràng", "態度があいまいだ (thái độ mập mờ, nước đôi)", "[Từ gạch chân câu 220] Đồng nghĩa với はっきりしない.", True),
    ("丁寧", "ていねい (丁寧)", "Lịch sự, cẩn thận, chu đáo", "丁寧な言葉遣い (cách dùng từ lịch sự, nhã nhặn)", "Thái độ tôn trọng, cẩn thận.", False),
    ("はっきりしない", "はっきりしない", "Không rõ ràng, không dứt khoát", "態度がはっきりしない (thái độ không dứt khoát, mập mờ)", "[Đáp án đúng câu 220] = あいまい.", True),
    ("立派", "りっぱ (立派)", "Tuyệt vời, đàng hoàng, vẻ vang", "立派な業績を残す (để lại thành tích xuất sắc, đáng nể)", "Đáng khâm phục, hoành tráng.", False),
    ("情けない", "なさけない (情けない)", "Thảm hại, đáng thương, đáng xấu hổ", "こんなミスをするなんて情けない (mắc lỗi ngớ ngẩn thế này thật thảm hại)", "Tự trách bản thân hoặc thấy tệ hại.", False),

    # 221
    ("思いがけない", "おもいがけない", "Bất ngờ, ngoài dự tính, không ngờ tới", "思いがけない出来事 (sự việc bất ngờ xảy đến)", "[Từ gạch chân câu 221] Đồng nghĩa với 意外な.", True),
    ("面白い", "おもしろい", "Thú vị, hấp dẫn, hài hước", "面白い小説を読む (đọc một cuốn tiểu thuyết hay)", "Gây hứng thú, cười vui.", False),
    ("悲しい", "かなしい", "Đau buồn, buồn bã", "悲しい知らせを聞く (nghe tin buồn)", "Tâm trạng đau lòng.", False),
    ("意外な", "いがいな", "Bất ngờ, ngoài sức tưởng tượng", "意外な結果に驚く (ngạc nhiên trước kết quả bất ngờ)", "[Đáp án đúng câu 221] = 思いがけない.", True),
    ("不思議な", "ふしぎな", "Kỳ lạ, kỳ diệu, bí ẩn", "不思議な現象が起こる (xảy ra hiện tượng kỳ bí)", "Không thể giải thích bằng lẽ thường.", False),

    # 222
    ("みずから", "みずから (自ら)", "Tự mình, đích thân, tự thân", "みずから会社を立ち上げる (tự mình đứng ra thành lập công ty)", "[Từ gạch chân câu 222] Đồng nghĩa với 自分で.", True),
    ("自分で", "じぶんで", "Tự bản thân mình", "自分で決める (tự bản thân quyết định)", "[Đáp án đúng câu 222] = みずから.", True),
    ("すぐに", "すぐに", "Ngay lập tức, tức thì", "すぐに電話する (gọi điện thoại ngay lập tức)", "Khoảng thời gian cực ngắn sau đó.", False),
    ("仲間と", "なかまと", "Cùng với bạn bè bè bạn", "仲間と協力する (hợp tác cùng bạn bè chiến hữu)", "Đi cùng đồng đội.", False),
    ("しばらくして", "しばらくして", "Một lúc sau, một lát sau", "しばらくして雨がやんだ (một lát sau trời tạnh mưa)", "Trôi qua một đoạn thời gian ngắn.", False),

    # 223
    ("そろう", "そろう (揃う)", "Tập hợp đầy đủ, tề tựu đông đủ", "全員がそろう (mọi người đã tập hợp đầy đủ)", "[Từ gạch chân câu 223] Đồng nghĩa với 集まる.", True),
    ("集まる", "あつまる", "Tập trung lại, tụ họp", "広場に人が集まる (mọi người tụ tập ở quảng trường)", "[Đáp án đúng câu 223] = そろう.", True),
    ("訪ねる", "たずねる", "Đến thăm, ghé chơi", "恩師の家を訪ねる (đến thăm nhà thầy giáo cũ)", "Ghé thăm ai đó.", False),
    ("出発する", "しゅっぱつする", "Xuất phát, khởi hành", "定刻に出発する (khởi hành đúng giờ)", "Bắt đầu chuyến đi.", False),
    ("案内する", "あんないする", "Hướng dẫn, dẫn đường", "市内を案内する (dẫn đường hướng dẫn tham quan nội thành)", "Chỉ dẫn đường đi lối lại.", False),

    # 224
    ("およそ", "およそ", "Khoảng chừng, xấp xỉ (= 約)", "荷物の重さはおよそ5キロ (khối lượng hành lý khoảng chừng 5kg)", "[Từ gạch chân câu 224] Đồng nghĩa với だいたい.", True),
    ("全部で", "ぜんぶで", "Tổng cộng tất cả", "全部でいくらですか (tất cả hết bao nhiêu tiền)", "Toàn bộ số lượng tính gộp.", False),
    ("ぴったり", "ぴったり", "Vừa khít, chuẩn xác không thừa thiếu", "時間がぴったりだ (giờ giấc chuẩn xác từng phút)", "Không xê xích chút nào.", False),
    ("だいたい", "だいたい", "Đại khái, khoảng chừng, hầu như", "だいたい理解した (đại khái đã hiểu gần hết)", "[Đáp án đúng câu 224] = およそ.", True),
    ("それぞれ", "それぞれ", "Từng người, mỗi cái một vẻ", "それぞれ意見を言う (mỗi người đưa ra ý kiến riêng)", "Chỉ từng cá thể riêng rẽ.", False),

    # 225
    ("プラン", "プラン", "Kế hoạch, bản dự thảo (plan)", "具体的なプランを教えてほしい (hãy nói cho tôi kế hoạch cụ thể)", "[Từ gạch chân câu 225] Đồng nghĩa với 計画.", True),
    ("理由", "りゆう", "Lý do, nguyên cớ", "遅刻した理由を説明する (giải thích lý do đi muộn)", "Nguyên nhân sự việc.", False),
    ("情報", "じょうほう", "Thông tin, dữ liệu", "最新の情報を集める (thu thập thông tin mới nhất)", "Tin tức dữ liệu trong đời sống/máy móc.", False),
    ("特徴", "とくちょう", "Đặc trưng, điểm nổi bật", "商品の特徴をアピールする (quảng bá đặc trưng sản phẩm)", "Nét riêng biệt của sự vật.", False),
    ("計画", "けいかく", "Kế hoạch, dự định", "将来の計画を立てる (lên kế hoạch cho tương lai)", "[Đáp án đúng câu 225] = プラン.", True),

    # 226
    ("依然として", "いぜんとして", "Vẫn như trước, vẫn y nguyên", "経済状況は依然として厳しい (tình hình kinh tế vẫn gay gắt như cũ)", "[Từ gạch chân câu 226] Đồng nghĩa với 相変わらず.", True),
    ("相変わらず", "あいかわらず", "Vẫn như cũ, như mọi khi", "相変わらず元気そうだ (trông anh vẫn khỏe khoắn như mọi khi)", "[Đáp án đúng câu 226] = 依然として.", True),
    ("思ったとおり", "おもったとおり", "Đúng như đã nghĩ", "思ったとおりの結果になった (kết quả diễn ra đúng như dự đoán)", "Khớp với suy nghĩ ban đầu.", False),
    ("実際には", "じっさいには", "Trên thực tế", "実際にはそう簡単ではない (trên thực tế không hề đơn giản vậy)", "Đối chiếu với thực tế ngoài đời.", False),
    ("これまでより", "これまでより", "Hơn so với trước đây", "これまでより努力が必要だ (cần nỗ lực hơn trước đây nhiều)", "So sánh với thời gian trong quá khứ.", False),

    # 227
    ("必死", "ひっし", "Dốc hết sức, liều mạng, hết mình", "あのときは本当に必死だった (khi ấy tôi đã thực sự dốc hết toàn lực)", "[Từ gạch chân câu 227] Đồng nghĩa với 一生懸命.", True),
    ("危ない", "あぶない", "Nguy hiểm", "危ないから近寄るな (nguy hiểm đừng lại gần)", "Mối đe dọa an toàn.", False),
    ("一生懸命", "いっしょうけんめい", "Hết sức mình, miệt mài dốc lòng", "一生懸命勉強する (dốc sức miệt mài học tập)", "[Đáp án đúng câu 227] = 必死.", True),
    ("緊張した", "きんちょうした", "Căng thẳng, hồi hộp", "面接でとても緊張した (vô cùng căng thẳng trong buổi phỏng vấn)", "Trạng thái tâm lý tim đập chân run.", False),
    ("恐ろしかった", "おそろしかった", "Kinh khủng, đáng sợ khiếp đảm", "恐ろしい夢を見て起きた (tỉnh dậy sau cơn ác mộng kinh hoàng)", "Gây sợ hãi cực độ.", False),

    # 228
    ("ふもと", "ふもと (麓)", "Chân núi, vùng chân đồi", "山のふもとにきれいな湖がある (ở chân núi có một hồ nước tuyệt đẹp)", "[Từ gạch chân câu 228] Đồng nghĩa với 山の下のほう.", True),
    ("山の向こう", "やまのむこう", "Phía bên kia ngọn núi", "山の向こうに海が見える (bên kia núi nhìn thấy biển)", "Vị trí khuất sau dãy núi.", False),
    ("山の上のほう", "やまのうえのほう", "Phía trên đỉnh núi, phía cao", "山の上のほうは雪が積もっている (phía trên núi tuyết đóng dày)", "Khu vực đỉnh núi.", False),
    ("山の中間あたり", "やまのちゅうかんあたり", "Khu vực lưng chừng núi", "山の中間あたりで休憩する (nghỉ chân ở lưng chừng núi)", "Lưng chừng núi.", False),
    ("山の下のほう", "やまのしたのほう", "Phía chân núi, vùng dưới thấp", "山の下のほうに村がある (phía dưới chân núi có ngôi làng)", "[Đáp án đúng câu 228] = ふもと.", True),

    # 229
    ("そろえる", "そろえる (揃える)", "Làm cho đồng đều, đồng nhất", "文字のサイズをそろえてください (xin hãy chỉnh cỡ chữ cho đồng nhất)", "[Từ gạch chân câu 229] Đồng nghĩa với 同じにする.", True),
    ("大きくして", "おおきくして", "Làm cho to lớn ra", "写真を大きくして印刷する (phóng to ảnh rồi in)", "Tăng kích thước.", False),
    ("同じにして", "おなじにして", "Làm cho giống nhau, đồng nhất kích cỡ", "サイズを同じにして並べる (chỉnh kích cỡ bằng nhau rồi xếp ngay ngắn)", "[Đáp án đúng câu 229] = そろえる.", True),
    ("調べて", "しらべて", "Tra cứu, tìm hiểu", "辞書で意味を調べてみる (tra từ điển xem ý nghĩa)", "Kiểm tra thông tin.", False),

    # 230
    ("買い占める", "かいしめる", "Mua vét sạch, mua gom toàn bộ", "空いた土地を買いしめた (mua gom sạch toàn bộ khu đất trống)", "[Từ gạch chân câu 230] Đồng nghĩa với 全部買った.", True),
    ("無理に買った", "むりにかった", "Mua gượng ép, cố quá sức mua", "予算オーバーだが無理に買った (quá ngân sách nhưng vẫn cố bấm bụng mua)", "Mua quá khả năng.", False),
    ("全部買った", "ぜんぶかった", "Mua toàn bộ, mua hết sạch", "店頭の商品を全部買った (mua sạch sành sanh hàng trên kệ)", "[Đáp án đúng câu 230] = 買い占める.", True),
    ("安く買った", "やすくかった", "Mua với giá rẻ", "セールで安く買った (mua được giá rẻ trong đợt giảm giá)", "Mua được hời.", False),
    ("さっそく買った", "さっそくかった", "Mua ngay lập tức không chần chừ", "発売日にさっそく買った (vừa mở bán là mua liền tay)", "Làm ngay lập tức.", False),

    # 231
    ("間際", "まぎわ", "Ngay trước khi, sát nút (= 直前)", "出発間際に電話がかかってきた (ngay trước khi xuất phát thì điện thoại reo)", "[Từ gạch chân câu 231] Đồng nghĩa với 直前.", True),
    ("直前", "ちょくぜん", "Ngay trước thời điểm", "テストの直前に復習する (ôn bài ngay sát giờ thi)", "[Đáp án đúng câu 231] = 間際.", True),
    ("直後", "ちょくご", "Ngay sau thời điểm", "卒業の直後に就職した (vừa tốt nghiệp xong là đi làm ngay)", "Ngay sau khi kết thúc.", False),
    ("当日", "とうじつ", "Ngày diễn ra sự kiện, chính ngày hôm đó", "試験の当日に遅刻する (đến muộn vào đúng ngày thi)", "Ngày ấn định sự kiện.", False),
    ("前日", "ぜんじつ", "Ngày hôm trước", "結婚式の前日に準備を終える (hoàn tất chuẩn bị vào ngày hôm trước đám cưới)", "Ngày liền kề trước.", False),

    # 232
    ("たちまち", "たちまち", "Ngay lập tức, tức thì trong chớp mắt", "薬を飲んだらたちまち治まった (uống thuốc xong là cơn đau dịu ngay lập tức)", "[Từ gạch chân câu 232] Đồng nghĩa với すぐに.", True),
    ("すっかり", "すっかり", "Hoàn toàn, sạch trơn", "すっかり忘れていた (quên bẵng đi hoàn toàn)", "Hết sạch không còn vết tích.", False),
    ("やっと", "やっと", "Cuối cùng thì (sau nhiều gian nan)", "やっと宿題が終わった (cuối cùng cũng làm xong bài tập)", "Kết quả sau một thời gian dài nỗ lực.", False),
    ("すぐに", "すぐに", "Ngay lập tức", "すぐに医者を呼んでください (hãy gọi bác sĩ tới ngay lập tức)", "[Đáp án đúng câu 232] = たちまち.", True),
    ("確かに", "たしかに", "Chắc chắn, quả thật đúng như vậy", "確かに彼の言うとおりだ (quả thật đúng như lời anh ấy nói)", "Xác nhận sự thật.", False),

    # 233
    ("お勘定", "おかんじょう", "Thanh toán hóa đơn tiền bạc", "もうお勘定は済ませました (tôi đã thanh toán tiền xong rồi)", "[Từ gạch chân câu 233] Đồng nghĩa với お金を払う.", True),
    ("注文する", "ちゅうもんする", "Gọi món, đặt hàng", "レストランで料理を注文する (gọi món ăn ở nhà hàng)", "Yêu cầu món hoặc đặt hàng.", False),
    ("予約する", "よやくする", "Đặt chỗ trước, đặt bàn trước", "ホテルの部屋を予約する (đặt phòng khách sạn trước)", "Giữ chỗ trước.", False),
    ("呼ぶ", "よぶ", "Gọi ai đó lại", "店員を大きな声で呼ぶ (gọi nhân viên bằng giọng to)", "Cất tiếng gọi.", False),
    ("お金を払う", "おかねをはらう", "Thanh toán tiền, trả tiền", "レジでお金を払う (trả tiền ở quầy thu ngân)", "[Đáp án đúng câu 233] = お勘定をする.", True),

    # 234
    ("異なる", "ことなる", "Khác nhau, sai khác", "テーマが異なる (chủ đề bài báo cáo khác nhau)", "[Từ gạch chân câu 234] Đồng nghĩa với 違う.", True),
    ("単純", "たんじゅん", "Đơn giản, đơn thuần", "単純なミス (sai sót đơn giản, ngớ ngẩn)", "Không phức tạp.", False),
    ("似ている", "にている", "Tương tự, giống nhau", "親によく似ている (rất giống bố mẹ)", "Có nhiều nét tương đồng.", False),
    ("複雑", "ふくざつ", "Phức tạp, rắc rối", "複雑な人間関係 (mối quan hệ con người phức tạp)", "Nhiều yếu tố rườm rà.", False),
    ("違う", "ちがう", "Khác biệt, không giống", "意見が違う (quan điểm khác nhau)", "[Đáp án đúng câu 234] = 異なる.", True),

    # 235
    ("たまたま", "たまたま", "Tình cờ, ngẫu nhiên gặp", "街でたまたま会った (tình cờ gặp nhau trên phố)", "[Từ gạch chân câu 235] Đồng nghĩa với 偶然.", True),
    ("偶然", "ぐうぜん", "Ngẫu nhiên, tình cờ bất ngờ", "偶然の出会い (cuộc gặp gỡ định mệnh tình cờ)", "[Đáp án đúng câu 235] = たまたま.", True),
    ("何度も", "なんども", "Nhiều lần, lặp đi lặp lại", "何度も同じ過ちを繰り返す (lặp lại cùng một sai lầm nhiều lần)", "Số lần diễn ra nhiều.", False),
    ("さっき", "さっき", "Vừa nãy, lúc nãy", "さっき届いた手紙 (bức thư vừa mới tới lúc nãy)", "Thời điểm rất gần trong quá khứ.", False),

    # 236
    ("明らかな", "あきらかな", "Rõ ràng, minh bạch, rành rành", "明らかな証拠がある (có bằng chứng rành rành rõ ràng)", "[Từ gạch chân câu 236] Đồng nghĩa với はっきりした.", True),
    ("様々な", "さまざまな", "Đa dạng, muôn màu muôn vẻ", "様々な意見がある (có nhiều luồng ý kiến đa dạng)", "Phong phú về chủng loại.", False),
    ("別の", "べつの", "Khác, biệt lập", "別の方法を試す (thử một phương pháp khác)", "Không phải cái này mà là cái khác.", False),
    ("新しい", "あたらしい", "Mới mẻ", "新しい靴を買う (mua một đôi giày mới)", "Mới tinh, chưa cũ.", False),
    ("はっきりした", "はっきりした", "Rõ ràng, không mập mờ", "はっきりした証拠 (chứng cứ rành rành rõ ràng)", "[Đáp án đúng câu 236] = 明らかな.", True),

    # 237
    ("用心", "ようじん", "Cẩn trọng, đề phòng, chú ý cẩn thận", "できるだけ用心したほうがいい (nên cẩn trọng đề phòng hết mức có thể)", "[Từ gạch chân câu 237] Đồng nghĩa với 注意.", True),
    ("注意", "ちゅうい", "Chú ý, cẩn thận, cảnh giác", "足元に注意する (chú ý cẩn thận dưới chân)", "[Đáp án đúng câu 237] = 用心.", True),
    ("努力", "どりょく", "Nỗ lực, cố gắng hết mình", "目標に向かって努力する (nỗ lực hướng tới mục tiêu)", "Cố gắng chăm chỉ.", False),
    ("我慢", "がまん", "Chịu đựng, nhẫn nhịn", "痛みを我慢する (cắn răng chịu đựng cơn đau)", "Kìm nén cảm xúc/đau đớn.", False),
    ("遠慮", "えんりょ", "Khách khí, ngần ngại, kiêng dè", "遠慮なく召し上がってください (xin đừng ngần ngại, hãy ăn tự nhiên)", "Khách sáo e dè.", False),

    # 238
    ("騒々しい", "そうぞうしい", "Ồn ào, náo loạn, om sòm", "会場が急にそうぞうしくなった (hội trường bỗng nhiên ồn ào náo loạn hẳn lên)", "[Từ gạch chân câu 238] Đồng nghĩa với うるさい.", True),
    ("暗い", "くらい", "Tối tăm, u ám", "部屋が暗い (căn phòng tối om)", "Thiếu ánh sáng.", False),
    ("静か", "しずか", "Yên tĩnh, thanh tịnh", "静かな夜 (đêm thanh vắng)", "Không có tiếng ồn.", False),
    ("うるさい", "うるさい", "Ồn ào, làm phiền chói tai", "工事の音がうるさい (tiếng công trường ồn ào inh ỏi)", "[Đáp án đúng câu 238] = そうぞうしい.", True),
    ("寒い", "さむい", "Lạnh lẽo (thời tiết)", "外はとても寒い (bên ngoài trời rất lạnh)", "Nhiệt độ không khí thấp.", False),

    # 239
    ("所有している", "しょゆうしている", "Sở hữu, có trong tay (tài sản)", "店を所有している (nắm quyền sở hữu cửa tiệm)", "[Từ gạch chân câu 239] Đồng nghĩa với 持っている.", True),
    ("探す", "さがす", "Tìm kiếm đồ vật/con người", "鍵を探す (tìm chìa khóa)", "Đi tìm vật bị mất.", False),
    ("借りる", "かりる", "Vay mượn, thuê nhà", "本を借りる (mượn sách)", "Nhận dùng tạm rồi trả.", False),
    ("持っている", "もっている", "Nắm giữ, sở hữu trong tay", "自分の店を持っている (có quán của riêng mình)", "[Đáp án đúng câu 239] = 所有している.", True),
    ("建てる", "たてる", "Xây dựng công trình", "家を建てる (xây nhà)", "Dựng lên nhà cửa.", False),

    # 240
    ("おそらく", "おそらく", "Có lẽ, chắc là (phỏng đoán có căn cứ)", "おそらく来ないと思う (có lẽ anh ấy sẽ không đến đâu)", "[Từ gạch chân câu 240] Đồng nghĩa với たぶん.", True),
    ("たぶん", "たぶん", "Có lẽ, có thể", "たぶん雨が降るだろう (có lẽ trời sẽ mưa)", "[Đáp án đúng câu 240] = おそらく.", True),
    ("当然", "とうぜん", "Đương nhiên, dĩ nhiên", "合格して当然だ (đỗ là chuyện đương nhiên)", "Hiển nhiên phải thế.", False),
    ("やはり", "やはり", "Quả nhiên đúng như dự đoán", "やはり彼が勝った (quả nhiên anh ấy đã thắng)", "Đúng như linh tính/dự liệu.", False),
    ("絶対", "ぜったい", "Tuyệt đối, nhất định 100%", "絶対に諦めない (tuyệt đối không bỏ cuộc)", "Khẳng định chắc chắn.", False),

    # 241
    ("収納する", "しゅうのうする", "Cất gọn, xếp gọn vào ngăn nắp", "収納していない物がたくさんある (còn nhiều đồ đạc chưa được cất gọn ghẽ)", "[Từ gạch chân câu 241] Đồng nghĩa với しまう.", True),
    ("集める", "あつめる", "Gom lại, thu thập", "切手を集める (sưu tầm tem)", "Gom nhiều thứ về một chỗ.", False),
    ("預ける", "あずける", "Gửi đồ, giao phó tiền/con trẻ", "荷物をロッカーに預ける (gửi hành lý vào tủ khóa)", "Nhờ người khác trông nom.", False),
    ("返す", "かえす", "Trả lại đồ vật", "借りた本を返す (trả lại cuốn sách đã mượn)", "Đem hoàn trả chủ cũ.", False),
    ("しまう", "しまう", "Cất vào trong tủ/hộp ngăn nắp", "服をクローゼットにしまう (cất quần áo gọn gàng vào tủ)", "[Đáp án đúng câu 241] = 収納する.", True),

    # 242
    ("小柄", "こがら", "Vóc dáng nhỏ nhắn, người bé", "母に似て小柄だ (dáng người nhỏ nhắn giống mẹ)", "[Từ gạch chân câu 242] Đồng nghĩa với 体が小さい.", True),
    ("声が小さい", "こえがちいさい", "Giọng nói nhỏ nhẹ", "声が小さくて聞こえない (giọng lí nhí không nghe thấy gì)", "Âm lượng bé.", False),
    ("力が弱い", "ちからがよわい", "Sức lực yếu ớt", "腕の力が弱い (lực cánh tay yếu)", "Không có cơ bắp/thể lực.", False),
    ("体が小さい", "からだがちいさい", "Thân hình nhỏ nhắn", "体が小さくてすばしっこい (người nhỏ nhắn mà thoăn thoắt)", "[Đáp án đúng câu 242] = 小柄.", True),
    ("心が弱い", "こころがよわい", "Tâm hồn mềm yếu, dễ nản lòng", "心が弱くてくじけやすい (tâm lý yếu dễ nản chí)", "Dễ bị tổn thương.", False),

    # 243
    ("無口", "むくち", "Kiệm lời, ít nói, trầm ngâm", "鈴木さんは無口な性格だ (anh Suzuki là người trầm tính ít nói)", "[Từ gạch chân câu 243] Đồng nghĩa với あまり話さない.", True),
    ("あまり笑わない", "あまりわらわない", "Ít khi cười đùa", "彼は真面目で滅多に笑わない (anh ấy nghiêm túc hiếm khi cười)", "Khuôn mặt lạnh lùng.", False),
    ("あまり話さない", "あまりはなさない", "Ít trò chuyện, không hay nói", "普段はあまり話さない (bình thường rất ít khi nói chuyện)", "[Đáp án đúng câu 243] = 無口.", True),
    ("あまり思わない", "あまりおもわない", "Không nghĩ ngợi nhiều", "そうはあまり思わない (tôi không nghĩ như thế cho lắm)", "Không có quan điểm mạnh.", False),
    ("あまり食べない", "あまりたべない", "Ăn ít, kén ăn", "小食であまり食べない (ăn như mèo ngửi, ăn rất ít)", "Lượng thức ăn nạp vào ít.", False),

    # 244
    ("やや", "やや", "Một chút, hơi hơi, đôi chút", "今日よりやや涼しくなる (trời sẽ se lạnh hơn một chút so với hôm nay)", "[Từ gạch chân câu 244] Đồng nghĩa với 少し.", True),
    ("もっと", "もっと", "Hơn nữa, nhiều hơn nữa", "もっと勉強しなさい (hãy học chăm hơn nữa)", "Mức độ tăng thêm.", False),
    ("少し", "すこし", "Một chút, một ít", "少し休もう (nghỉ ngơi một chút nào)", "[Đáp án đúng câu 244] = やや.", True),

    # 245
    ("テンポ", "テンポ", "Tốc độ, nhịp độ bài hát/công việc", "テンポの速い曲 (bài hát có tiết tấu nhanh)", "[Từ gạch chân câu 245] Đồng nghĩa với 速さ.", True),
    ("速さ", "はやさ", "Tốc độ, độ nhanh", "走る速さを競う (thi thố tốc độ chạy)", "[Đáp án đúng câu 245] = テンポ.", True),
    ("長さ", "ながさ", "Độ dài kích thước/thời gian", "スカートの長さを調節する (chỉnh độ dài chiếc váy)", "Chiều dài centimet.", False),
    ("高さ", "たかさ", "Chiều cao, độ cao", "山の高さを測る (đo độ cao của ngọn núi)", "Khoảng cách thẳng đứng.", False),
    ("明るさ", "あかるさ", "Độ sáng sủa; tính vui vẻ", "部屋の明るさを調節する (chỉnh độ sáng căn phòng)", "Ánh sáng hoặc tính cách rạng rỡ.", False),

    # 246
    ("妙な", "みょうな", "Kỳ lạ, kỳ quặc, khác thường", "妙な噂を耳にする (nghe thấy tin đồn kỳ lạ quái gở)", "[Từ gạch chân câu 246] Đồng nghĩa với 変な.", True),
    ("うれしい", "うれしい", "Vui mừng, sung sướng", "合格できて本当にうれしい (được đỗ thấy thật sung sướng)", "Cảm xúc hân hoan.", False),
    ("変な", "へんな", "Kỳ lạ, quái dị, bất thường", "変な音が聞こえる (nghe thấy âm thanh quái lạ)", "[Đáp án đúng câu 246] = 妙な.", True),
    ("嫌な", "いやな", "Khó chịu, ghét bỏ", "嫌な予感がする (có dự cảm chẳng lành)", "Cảm giác không thích thú.", False),

    # 247
    ("ささやく", "ささやく", "Thì thầm, nói nhỏ nhẹ bên tai", "耳元で愛をささやく (thì thầm lời yêu bên vành tai)", "[Từ gạch chân câu 247] Đồng nghĩa với 小声で話す.", True),
    ("急いで", "いそいで", "Vội vã, gấp gáp", "急いで家を出る (vội vàng rời khỏi nhà)", "Hành động nhanh chóng do gấp.", False),
    ("ゆっくり", "ゆっくり", "Chậm rãi, từ tốn", "ゆっくり話してください (xin hãy nói chậm rãi)", "Tốc độ thong dong.", False),
    ("大声で", "おおごえで", "Bằng giọng lớn, hét to", "大声で助けを呼ぶ (hét lớn kêu cứu)", "Âm lượng cực lớn.", False),
    ("小声で", "こごえで", "Bằng giọng nhỏ, thì thào", "小声で相談する (bàn bạc thì thào với nhau)", "[Đáp án đúng câu 247] = ささやく.", True),

    # 248
    ("かつて", "かつて", "Trước đây, xưa kia, từng có một thời", "かつてフランスに住んでいた (ngày trước tôi từng sống ở Pháp)", "[Từ gạch chân câu 248] Đồng nghĩa với 以前.", True),
    ("確か", "たしか", "Chắc chắn, chính xác", "確か昨日のことだ (chắc chắn là chuyện ngày hôm qua)", "Nhớ mang máng nhưng khá chắc.", False),
    ("主に", "おもに", "Chủ yếu, phần lớn", "主にお米を主食としている (chủ yếu lấy gạo làm thức ăn chính)", "Bộ phận nòng cốt chiếm đa số.", False),
    ("以前", "いぜん", "Trước đây, ngày trước", "以前お会いしたことがあります (ngày trước tôi đã từng có dịp gặp bác)", "[Đáp án đúng câu 248] = かつて.", True),
    ("しばらく", "しばらく", "Một thời gian, một lúc", "しばらくお待ちください (xin vui lòng đợi trong giây lát)", "Khoảng thời gian ngắn/dài tùy ngữ cảnh.", False),

    # 249
    ("たびたび", "たびたび", "Thường xuyên, lặp đi lặp lại nhiều lần", "たびたび注意される (thường xuyên bị nhắc nhở nhiều lần)", "[Từ gạch chân câu 249] Đồng nghĩa với 何度も.", True),
    ("必ず", "かならず", "Nhất định, chắc chắn phải làm", "必ず約束を守る (nhất định giữ đúng lời hứa)", "Khẳng định tuyệt đối 100%.", False),
    ("ようやく", "ようやく", "Cuối cùng thì cũng (sau nhiều trắc trở)", "ようやく夢が叶った (cuối cùng ước mơ cũng thành hiện thực)", "Sau một quá trình gian nan.", False),
    ("何度も", "なんども", "Nhiều lần", "何度も復習する (ôn tập đi ôn tập lại nhiều lần)", "[Đáp án đúng câu 249] = たびたび.", True),

    # 250
    ("注目した", "ちゅうもくした", "Chú mục, hướng sự chú ý quan tâm vào", "発言に皆が注目した (mọi người đều đổ dồn sự chú ý vào lời phát biểu)", "[Từ gạch chân câu 250] Đồng nghĩa với 関心を持った.", True),
    ("関心を持った", "かんしんをもった", "Có sự quan tâm, để ý đến", "環境問題に関心を持つ (quan tâm tới các vấn đề môi trường)", "[Đáp án đúng câu 250] = 注目する.", True),
    ("疑問を持った", "ぎもんをもった", "Nảy sinh mối nghi hoặc, thắc mắc", "彼の行動に疑問を持つ (nảy sinh nghi ngờ đối với hành động của anh ấy)", "Có câu hỏi chất vấn trong lòng.", False),
    ("感動した", "かんどうした", "Xúc động, rung động tâm can", "素晴らしい映画に深く感動した (vô cùng xúc động trước bộ phim hay)", "Rung động cảm xúc mãnh liệt.", False),
    ("驚いた", "おどろいた", "Kinh ngạc, giật mình ngạc nhiên", "突然の知らせに大変驚いた (vô cùng kinh ngạc trước tin báo đột ngột)", "Bị bất ngờ ngoài dự liệu.", False),

    # 251
    ("じかに", "じかに (直に)", "Trực tiếp mặt đối mặt, không qua trung gian", "本人にじかに伝える (truyền đạt trực tiếp tới tận tay người đó)", "[Từ gạch chân câu 251] Đồng nghĩa với 直接.", True),
    ("直接", "ちょくせつ", "Trực tiếp", "直接会って話す (gặp gỡ trực tiếp để nói chuyện)", "[Đáp án đúng câu 251] = じかに.", True),
    ("あとで", "あとで", "Lát sau, để sau", "あとで連絡します (tôi sẽ liên lạc lại sau nhé)", "Thời điểm lùi lại phía sau.", False),
    ("すべて", "すべて", "Tất cả toàn bộ mọi thứ", "すべて順調に進んでいる (mọi thứ đều đang tiến triển suôn sẻ)", "Không chừa cái gì.", False),
    ("確実に", "かくじつに", "Một cách chắc chắn, không sai lệch", "確実に成功させる (chắc chắn sẽ làm cho thành công)", "Độ tin cậy 100%.", False),

    # 252
    ("衝突する", "しょうとつする", "Đâm vào nhau, va chạm tông nhau", "車と衝突するところだった (suýt chút nữa là đâm va chạm với ô tô)", "[Từ gạch chân câu 252] Đồng nghĩa với ぶつかる.", True),
    ("倒れる", "たおれる", "Ngã lăn ra, đổ sập", "強風で木が倒れた (gió lớn làm cây đổ rạp)", "Rơi ngã từ vị trí đứng thẳng.", False),
    ("壊れる", "こわれる", "Bị hỏng hóc, đổ vỡ", "機械が壊れて動かない (máy móc hỏng không chạy được)", "Mất đi chức năng sử dụng.", False),
    ("ぶつかる", "ぶつかる", "Đâm vào, va chạm phải", "電柱にぶつかる (tông va phải cột điện)", "[Đáp án đúng câu 252] = 衝突する.", True),
    ("破れる", "やぶれる", "Bị rách (giấy, áo quần)", "紙がビリッと破れた (tờ giấy bị rách toạc)", "Rách nát vật lý.", False),

    # 253
    ("ひきょうな", "ひきょうな (卑怯な)", "Hèn hạ, chơi bẩn, gian lận", "ひきょうなやり方は許せない (không thể tha thứ cho cách làm hèn hạ bẩn thỉu)", "[Từ gạch chân câu 253] Đồng nghĩa với ずるい.", True),
    ("ずるい", "ずるい", "Gian xảo, ranh mãnh, chơi xấu", "ずるい手を使って勝つ (dùng thủ đoạn gian lận để thắng)", "[Đáp án đúng câu 253] = ひきょうな.", True),
    ("厳しい", "きびしい", "Nghiêm khắc, khắc nghiệt", "厳しい指導を受ける (nhận sự chỉ bảo nghiêm khắc)", "Nghiêm túc không khoan nhượng.", False),
    ("しつこい", "しつこい", "Dai dẳng, lằng nhằng phát ngấy", "しつこく勧誘する (chèo kéo dai như đỉa)", "Lặp lại dai dẳng gây khó chịu.", False),

    # 254
    ("愉快な", "ゆかいな", "Hài hước, vui tính, mang lại tiếng cười", "愉快な仲間たち (những người bạn vui nhộn, tếu táo)", "[Từ gạch chân câu 254] Đồng nghĩa với 面白い.", True),
    ("おしゃれな", "おしゃれな", "Sành điệu, thời thượng phong cách", "おしゃれなカフェでお茶する (uống trà ở quán cà phê sành điệu)", "Gu ăn mặc/bày trí đẹp.", False),
    ("親切な", "しんせつな", "Tốt bụng, ân cần nhiệt tình", "親切な店員さん (nhân viên bán hàng tốt bụng niềm nở)", "Nhiệt tình giúp đỡ người khác.", False),
    ("かわいい", "かわいい", "Đáng yêu, xinh xắn dễ thương", "かわいい子犬 (chú cún con đáng yêu)", "Ngoại hình nhỏ nhắn dễ mến.", False),

    # 255
    ("やむをえない", "やむをえない", "Bất đắc dĩ, không còn cách nào khác", "やむをえない事情で欠席する (nghỉ học vì lý do bất khả kháng)", "[Từ gạch chân câu 255] Đồng nghĩa với しかたがない.", True),
    ("もったいない", "もったいない", "Lãng phí, tiếc của", "食べ物を残すのはもったいない (bỏ thừa đồ ăn thật là lãng phí)", "Tiếc rẻ của cải/tài năng.", False),
    ("つまらない", "つまらない", "Nhàm chán, vô vị", "つまらない冗談 (trò đùa vô duyên, nhạt nhẽo)", "Không có gì thu hút.", False),
    ("しかたがない", "しかたがない", "Đành chịu, không còn cách nào khác", "雨だから中止もしかたがない (trời mưa đành chịu hủy thôi)", "[Đáp án đúng câu 255] = やむをえない.", True),

    # 256
    ("息抜きした", "いきぬきした", "Nghỉ xả hơi, nghỉ giải lao", "少し息抜きしたほうがいい (nên nghỉ ngơi xả hơi một chút đi)", "[Từ gạch chân câu 256] Đồng nghĩa với 休んだ.", True),
    ("待った", "まった", "Chờ đợi ai đó", "駅で友達を待った (chờ bạn ở nhà ga)", "Ngóng đợi thời gian.", False),
    ("急いだ", "いそいだ", "Vội vã, gấp rút", "走って急いだ (chạy vội vã)", "Tăng tốc vì sợ muộn.", False),
    ("休んだ", "やすんだ", "Nghỉ ngơi, tĩnh dưỡng", "仕事を休んで旅行に行く (nghỉ làm đi du lịch)", "[Đáp án đúng câu 256] = 息抜きする.", True),
    ("働いた", "はたらいた", "Lao động, làm việc", "一日中真面目に働いた (làm việc chăm chỉ suốt cả ngày)", "Làm công việc kiếm sống.", False),

    # 257
    ("ついている", "ついている", "May mắn, đỏ vận, gặp thời", "今日はとてもついていた (hôm nay tôi gặp may mắn cực kỳ)", "[Từ gạch chân câu 257] Đồng nghĩa với 運がよかった.", True),
    ("気分が悪かった", "きぶんがわるかった", "Tâm trạng tệ; khó ở trong người", "体調を崩して気分が悪かった (người ớn lạnh khó ở trong người)", "Khó chịu cơ thể hoặc bực bội.", False),
    ("運が悪かった", "うんがわるかった", "Xui xẻo, đen đủi, không may", "くじが外れて運が悪かった (bốc trượt vé số xui ghê)", "Trái nghĩa với ついている.", False),
    ("気分がよかった", "きぶんがよかった", "Tâm trạng phấn chấn sảng khoái", "天気が晴れて気分がよかった (trời nắng ráo tâm trạng rất tốt)", "Cảm giác khoan khoái tâm hồn.", False),
    ("運がよかった", "うんがよかった", "Vận đỏ, may mắn", "雨に降られず運がよかった (không bị dính mưa may mắn thật)", "[Đáp án đúng câu 257] = ついている.", True),

    # 258
    ("つねに", "つねに (常に)", "Luôn luôn, lúc nào cũng", "つねに言葉遣いに気をつける (luôn luôn để ý cẩn trọng lời ăn tiếng nói)", "[Từ gạch chân câu 258] Đồng nghĩa với いつも.", True),
    ("いつも", "いつも", "Lúc nào cũng, mọi khi", "いつも笑顔を絶やさない (lúc nào cũng giữ nụ cười rạng rỡ)", "[Đáp án đúng câu 258] = つねに.", True),
    ("特に", "とくに", "Đặc biệt là", "特に問題はない (đặc biệt không có vấn đề gì lớn)", "Nhấn mạnh trường hợp cụ thể.", False),
    ("できるだけ", "できるだけ", "Cố gắng hết sức trong khả năng", "できるだけ早く返事する (trả lời sớm nhất trong khả năng có thể)", "Tùy theo năng lực tối đa.", False),

    # 259
    ("当てる", "あてる", "Ném trúng, va vào, làm chạm vào", "車にボールを当ててしかられた (ném bóng trúng vào xe ô tô nên bị mắng)", "[Từ gạch chân câu 259] Đồng nghĩa với ぶつける.", True),
    ("ぶつける", "ぶつける", "Tông vào, va chạm vào", "壁に頭をぶつける (va đầu vào tường)", "[Đáp án đúng câu 259] = 当てる.", True),
    ("隠す", "かくす", "Che giấu, giấu đi", "宝物を土の中に隠す (giấu kho báu vào trong lòng đất)", "Che đậy không cho thấy.", False),
    ("落とす", "おとす", "Làm rơi, đánh rơi", "財布を道に落とす (đánh rơi ví ra đường)", "Làm đồ vật rơi xuống đất.", False),
    ("詰める", "つめる", "Nhồi nhét, đóng gói chặt", "箱に荷物を詰める (nhét đồ vào hộp carton)", "Đưa vào trong vật chứa.", False),

    # 260
    ("あわれな", "あわれな (哀れな)", "Đáng thương, bi đát, tội nghiệp", "あわれな人生を送る (trải qua cuộc đời bi đát đầy đáng thương)", "[Từ gạch chân câu 260] Đồng nghĩa với かわいそうな.", True),
    ("退屈な", "たいくつな", "Buồn tẻ, chán ngắt không có gì làm", "退屈な講義で居眠りする (ngủ gật vì bài giảng tẻ nhạt chán ngắt)", "Thiếu kích thích hứng thú.", False),
    ("おかしな", "おかしな", "Nực cười, kỳ quặc lạ lùng", "おかしな格好をしている (mặc bộ trang phục buồn cười kỳ quặc)", "Gây cười hoặc bất thường.", False),
    ("かわいそうな", "かわいそうな", "Đáng thương, tội nghiệp", "捨てられた子猫がかわいそうだ (chú mèo con bị bỏ rơi trông tội nghiệp quá)", "[Đáp án đúng câu 260] = あわれな.", True),
    ("不安な", "ふあんな", "Bất an, lo âu thấp thỏm", "将来に不安を抱く (thấp thỏm âu lo cho tương lai)", "Cảm giác không an lòng.", False),

    # 261
    ("当分", "とうぶん", "Hiện tại và sắp tới, tạm thời một thời gian", "当分は使わない予定です (tạm thời trong thời gian tới chưa có ý định dùng)", "[Từ gạch chân câu 261] Đồng nghĩa với しばらく.", True),
    ("これから", "これから", "Từ nay về sau, sắp sửa", "これから会議が始まる (từ giờ cuộc họp sẽ bắt đầu)", "Tính từ mốc hiện tại trở đi.", False),
    ("全部", "ぜんぶ", "Toàn bộ, tất cả", "全部片付けた (dọn dẹp sạch sẽ toàn bộ)", "Tất cả mọi thứ.", False),
    ("今回", "こんかい", "Lần này", "今回のテストは難しかった (bài thi lần này khó quá)", "Lượt hiện tại.", False),
    ("しばらく", "しばらく", "Một thời gian, tạm thời", "しばらく休養を取る (tạm thời nghỉ dưỡng một thời gian)", "[Đáp án đúng câu 261] = 当分.", True),

    # 262
    ("一転した", "いってんした", "Xoay chuyển 180 độ, thay đổi hoàn toàn", "留学の話が一転した (chuyện du học bỗng chốc đảo ngược thay đổi hoàn toàn)", "[Từ gạch chân câu 262] Đồng nghĩa với すっかり変わった.", True),
    ("急に止まった", "きゅうにとまった", "Đột ngột khựng lại, dừng gấp", "車が急に止まった (xe ô tô thắng gấp dừng lại đột ngột)", "Dừng lại bất thình lình.", False),
    ("すっかり変わった", "すっかりかわった", "Thay đổi hoàn toàn không còn như trước", "街の様子がすっかり変わった (diện mạo con phố đã thay đổi hoàn toàn)", "[Đáp án đúng câu 262] = 一転する.", True),
    ("少し進んだ", "すこしすすんだ", "Tiến triển thêm một chút", "工事が少し進んだ (công trình đã tiến thêm được một ít)", "Tăng thêm chút tiến độ.", False),
    ("とうとう許された", "とうとうゆるされた", "Cuối cùng đã được thứ lỗi/cho phép", "父にとうとう許された (cuối cùng đã được bố đồng ý cho phép)", "Nhận được sự ưng thuận sau cùng.", False),

    # 263
    ("じたばたする", "じたばたする", "Cuống cuồng, hoảng loạn, giãy giụa vô ích", "前日になってじたばたしても仕方がない (đến sát ngày thi mới cuống cuồng lên thì cũng chẳng ích gì)", "[Từ gạch chân câu 263] Đồng nghĩa với 慌てる.", True),
    ("慌てる", "あわてる", "Luống cuống, hoảng loạn mất bình tĩnh", "地震が起きても慌てないで (dù động đất cũng đừng hoảng loạn)", "[Đáp án đúng câu 263] = じたばたする.", True),
    ("心配する", "しんぱいする", "Lo lắng về điều gì", "親を心配させるな (đừng làm cho cha mẹ phải lo lắng)", "Lo âu trong lòng.", False),
    ("緊張する", "きんちょうする", "Căng thẳng hồi hộp", "本番で緊張する (hồi hộp căng thẳng trong buổi thi chính thức)", "Căng thẳng tinh thần.", False),
    ("悩む", "なやむ", "Trăn trở, đau đầu suy nghĩ", "進路について深く悩む (trăn trở sâu sắc về con đường tương lai)", "Suy tư bế tắc.", False),

    # 264
    ("テクニック", "テクニック", "Kỹ thuật, kỹ năng điêu luyện (technique)", "特別なテクニックが必要だ (cần có kỹ thuật kỹ năng đặc biệt)", "[Từ gạch chân câu 264] Đồng nghĩa với 技術.", True),
    ("技術", "ぎじゅつ", "Kỹ thuật, tay nghề, kỹ xảo", "高い技術を身につける (nắm vững tay nghề kỹ thuật cao)", "[Đáp án đúng câu 264] = テクニック.", True),
    ("知識", "ちしき", "Tri thức, kiến thức lý thuyết", "幅広い知識を持つ (sở hữu vốn kiến thức sâu rộng)", "Hiểu biết học thuật.", False),
    ("工夫", "くふう", "Sáng tạo, bỏ công tìm tòi giải pháp", "いろいろと工夫を凝らす (dày công tìm tòi sáng tạo phương thức mới)", "Nghĩ cách cải tiến.", False),
    ("訓練", "くんれん", "Huấn luyện, thao dượt rèn luyện", "厳しい訓練に耐える (chịu đựng quá trình huấn luyện gian khổ)", "Luyện tập bài bản theo kỷ luật.", False),

    # 265
    ("うつむく", "うつむく (俯く)", "Cúi gằm mặt xuống đất, cúi đầu", "黙ってうつむいていた (im lặng cúi gằm mặt nhìn xuống đất)", "[Từ gạch chân câu 265] Đồng nghĩa với 下を向く.", True),
    ("遠くを見る", "とおくをみる", "Nhìn ra nơi xa xôi", "窓から遠くの山を見る (nhìn ngắm rặng núi xa xôi ngoài cửa sổ)", "Hướng tầm mắt ra xa.", False),
    ("目を閉じる", "めをとじる", "Nhắm mắt lại", "目を閉じて音楽を聴く (nhắm nghiền mắt lắng nghe âm nhạc)", "Khép mi mắt lại.", False),
    ("下を向く", "したをむく", "Cúi đầu nhìn xuống phía dưới", "恥ずかしくて下を向く (xấu hổ quá nên cúi gằm đầu xuống)", "[Đáp án đúng câu 265] = うつむく.", True),
    ("腕を組む", "うでをくむ", "Khoanh tay trước ngực", "腕を組んで考え込む (khoanh tay trầm tư suy ngẫm)", "Tư thế khoanh tay.", False),

    # 266
    ("利口な", "りこうな (利口な)", "Khôn ngoan, thông minh lanh lợi", "本当に利口な犬ですね (chú chó này thật là thông minh khôn ngoan)", "[Từ gạch chân câu 266] Đồng nghĩa với 頭がいい.", True),
    ("頭がいい", "あたまがいい", "Thông minh, đầu óc sáng dạ", "頭がいい生徒 (học sinh thông minh, nhanh hiểu)", "[Đáp án đúng câu 266] = 利口な.", True),
    ("元気な", "げんきな", "Khỏe khoắn, tràn đầy năng lượng", "いつも元気な子ども (đứa trẻ lúc nào cũng khỏe mạnh hoạt bát)", "Thể chất tốt.", False),
    ("かっこいい", "かっこいい", "Ngầu, bảnh bao, phong độ", "かっこいい車に乗る (lái chiếc xe ô tô trông thật ngầu)", "Vẻ ngoài cuốn hút.", False),

    # 267
    ("用心した", "ようじんした", "Đề phòng, cẩn trọng chú ý", "もう少し用心したほうがいい (nên cẩn trọng chú ý đề phòng hơn một chút)", "[Từ gạch chân câu 267] Đồng nghĩa với 気をつける.", True),
    ("落ち着いた", "おちついた", "Bình tĩnh, điềm đạm, lắng xuống", "落ち着いて行動する (hành động một cách bình tĩnh)", "Giữ được sự điềm tĩnh.", False),
    ("がんばった", "がんばった", "Đã cố gắng hết sức", "最後までよくがんばった (đã cố gắng rất tốt tới tận phút chót)", "Nỗ lực làm việc.", False),
    ("よく考えた", "よくかんがえた", "Suy nghĩ kỹ càng", "よく考えてから決める (suy nghĩ thấu đáo rồi mới quyết định)", "Tư duy cẩn trọng.", False),
    ("気をつける", "きをつける", "Cẩn thận, chú ý đề phòng", "風邪を引かないように気をつける (cẩn thận chú ý kẻo bị cảm lạnh)", "[Đáp án đúng câu 267] = 用心する.", True),

    # 268
    ("くどい", "くどい", "Dài dòng, lặp đi lặp lại phát ngấy", "説明がくどくて困る (lời giải thích lải nhải dài dòng phát mệt)", "[Từ gạch chân câu 268] Đồng nghĩa với しつこい.", True),
    ("つまらない", "つまらない", "Nhàm chán, tẻ nhạt", "つまらない映画を見る (xem bộ phim nhạt nhẽo)", "Không có gì cuốn hút.", False),
    ("下手", "へた", "Kém cỏi, vụng về", "歌が下手だ (hát dở, kém hát)", "Kỹ năng không tốt.", False),
    ("しつこい", "しつこい", "Dai dẳng, lằng nhằng, lặp đi lặp lại", "しつこく質問する (hỏi dồn dập dai như đỉa)", "[Đáp án đúng câu 268] = くどい.", True)
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

for item in mondai5_vocab:
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
print(f"Appended {len(mondai5_vocab)} new vocabulary items! Total items in workbook is now {current_stt - 1}.")
