# He Thong On Tap Tu Vung JLPT N2

Ung dung web ho tro on tap 212 tu vung trong tam cap do JLPT N2, tap trung vao viec luyen nho cach doc (furigana/kana) va ghi nho cac dac diem, collocation, ngu canh xuat hien trong de thi thuc te.

---

## 1. Gioi thieu ve ung dung

Ung dung duoc xay dung bang framework Next.js (React / TypeScript / Tailwind CSS) voi phong cach thiet ke toi gian (Light Mode), mau chu dao la xam va trang, tap trung toi da vao trai nghiem hoc tap khong gay phan tam.

Cac chuc nang chinh bao gom:

### A. Che do on tap va luyen go (Quiz Mode)
- Nhan dien thong minh: Ho tro nguoi dung go truc tiep bang Hiragana, Katakana hoac Romaji. He thong tu dong chuyen doi va doi chieu dap an chinh xac.
- 2 phuong thuc luyen tap linh hoat:
  + Nhin tu go cach doc: Hien thi tu vung tieng Nhat (chu Han / Katakana) de nguoi dung tu nho va nhap cach doc.
  + Ban doc toi go lai (Chinh ta nghe): Tu vung va cach doc duoc an di, he thong tu dong phat am tieng Nhat truoc de nguoi dung nghe va go lai tu vung vua nghe duoc (chap nhan go chu Han, Kana hoac Romaji). Co nut bam nghe lai khong gioi han.
- Phat am tu dong: Sau moi lan nguoi dung nhap ket qua (du dung hay sai) hoac khi bam xem dap an, he thong se phat am chuan xac tu vung do bang giong doc tieng Nhat ban xu. Nguoi dung co the chu dong bat hoac tat chuc nang tu doc bang nut bam tren the tu.

### B. Hien thi ghi chu va dac diem tu vung (Trong tam)
- Moi tu vung deu co khung ghi chu dac diem ro rang:
  + Cac cum tu co dinh (collocation) kinh dien cua N2 (vi du: cac tu hay di voi gasshiri, men shiteiru, te oku,...).
  + Nguon goc tu muon tieng Anh va ngu canh su dung.
  + Y nghia tieng Viet chi tiet.
  + Cau vi du minh hoa di kem ban dich nghia day du.
- Tuy chon hien thi: Nguoi dung co the chon "Luon mo ghi chu" khi hoc hoac "An khi hoc" de thu thach tri nho truoc khi xem ket qua.

### C. Che do tra cuu va ghi chu (Table / Card Mode)
- Giao dien bang rong: Bang du lieu co the mo rong len den 1600px, co nut phong to toan man hinh hoac thu gon, giup cac cot khong bi chen ep va chu khong bi ngat xuong dong.
- Tinh nang an/hien cot cach doc de nguoi dung tu nham kiem tra nhanh toan bo 212 tu.
- Thanh cong cu tim kiem tuc thi theo chu Han, cach doc, nghia tieng Viet hoac tu khoa ghi chu.
- Nut chuyen nhanh tu bat ky tu vung nao trong danh sach vao che do luyen go.

### D. Dong bo du lieu tu dong (Live Sync)
- Nguon du lieu dong: Web tu dong doc truc tiep tu file Excel (Tu_Vung_On_Tap_JLPT_N2.xlsx) hoac file CSV (tu_vung.csv) nam trong thu muc goc.
- Tu dong cap nhat: Khi ban them tu moi vao file Excel/CSV va luu lai, chi can tai lai trang (F5) hoac bam nut Dong bo sheet tren thanh cong cu la tu moi se lap tuc duoc nap vao web.
- Bao toan tien trinh hoc: Tien trinh hoc (danh sach tu dung, tu sai can on lai, tu danh dau sao) duoc luu tru theo chu tu vung vao bo nho trinh duyet (localStorage), do do khi them hoac xep lai dong trong sheet thi ket qua hoc tap cu van duoc giu nguyen 100%.

### E. Toi uu hoa giao dien di dong (Responsive)
- Ho tro hoan hao tren ca may tinh, may tinh bang va dien thoai thong minh.
- Co che tu chuyen doi: Tren may tinh hien thi bang 7 cot rong rai; tren dien thoai tu dong chuyen sang danh sach the (Card List) vuot doc tien loi, khong can keo ngang.
- Kich thuoc chu va o nhap duoc can chinh toi thieu 16px de tranh loi tu dong phong to man hinh tren he dieu hanh iOS / Android.

---

## 2. Huong dan khoi dong va su dung

### Cach 1: Khoi dong nhanh bang file bat (Khuyen nghi)
1. Trong thu muc du an, nhap dup chuot vao file `chay_web_on_tap.bat`.
2. Cho khoang 2-3 giay de server khoi dong.
3. Mo trinh duyet va truy cap dia chi:
   - Tren may tinh: http://localhost:3000
   - Tren dien thoai (ket noi chung mang Wi-Fi): http://192.168.1.233:3000

### Cach 2: Khoi dong bang dong lenh (Terminal / PowerShell)
1. Mo terminal tai thu muc du an va chuyen vao thu muc web:
   ```bash
   cd vocab-web
   ```
2. Chay lenh khoi dong:
   ```bash
   npm run start -- -H 0.0.0.0 -p 3000
   ```
3. Truy cap tai http://localhost:3000

---

## 3. Huong dan tat server

Khi khong con su dung web, ban co the tat bang mot trong cac cach sau:
- Cach 1: Nhap dup vao file `tat_web.bat` trong thu muc goc. File se tu dong tim va dong tien trinh dang chay o cong 3000.
- Cach 2: Neu dang mo cua so dong lenh bat server, bam to hop phim `Ctrl + C` hoac bam dau `X` o goc tren ben phai cua so de dong.
- Cach 3: Chay lenh sau trong PowerShell:
  ```powershell
  Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
  ```

---

## 4. Cau truc thu muc du an

- `Tu_Vung_On_Tap_JLPT_N2.xlsx`: File Excel goc chua 212 tu vung va ghi chu dac diem N2.
- `tu_vung.csv`: File CSV du phong dung de dong bo du lieu.
- `chay_web_on_tap.bat`: Script chay web 1 click cho Windows.
- `tat_web.bat`: Script tat web 1 click cho Windows.
- `vocab-web/`: Ma nguon toan bo ung dung Next.js:
  + `vocab-web/app/page.tsx`: Giao dien va logic xu ly quiz, che do nghe chep, bang tra cuu, responsive.
  + `vocab-web/app/api/vocab/route.ts`: API route doc truc tiep du lieu tu file Excel/CSV tren may.
  + `vocab-web/lib/japaneseUtils.ts`: Bo tien ich xu ly am thanh, so sanh va chuyen doi tieng Nhat (Hiragana, Katakana, Romaji).
  + `vocab-web/data/vocabData.ts`: Du lieu khoi tao mac dinh.
