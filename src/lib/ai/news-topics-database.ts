export interface TopicTemplate {
  categorySlug: string;
  categoryName: string;
  headline: string;
  sapo: string;
  subheadings: string[];
  quotes: string;
  speaker: string;
  speakerRole: string;
  keyPoints: string[];
  tags: string[];
  imageUrl: string;
  imageAlt: string;
  imageCaption: string;
  imageCredit: string;
}

export const EDITORIAL_TOPICS: TopicTemplate[] = [
  // 1. THỜI SỰ
  {
    categorySlug: 'thoi-su',
    categoryName: 'Thời sự',
    headline: 'Đẩy mạnh phân cấp phân quyền và cải cách thủ tục hành chính phục vụ người dân',
    sapo: 'Chính phủ ban hành kế hoạch hành động trọng tâm nhằm cắt giảm triệt để các rào cản hành chính không cần thiết, chuyển từ tiền kiểm sang hậu kiểm minh bạch.',
    subheadings: [
      'Tinh gọn bộ máy và ứng dụng dữ liệu dân cư số',
      'Đo lường sự hài lòng của người dân làm thước đo hiệu quả',
      'Cam kết xử lý nhanh gọn các vướng mắc của cộng đồng doanh nghiệp'
    ],
    quotes: 'Cải cách thủ tục hành chính không chỉ là giảm giấy tờ, mà là giải phóng các nguồn lực sáng tạo trong xã hội và nâng cao niềm tin của người dân vào chính quyền số.',
    speaker: 'Nguyễn Văn Hùng',
    speakerRole: 'Chuyên gia Cải cách Hành chính',
    keyPoints: [
      '100% dịch vụ công đủ điều kiện được cung cấp trực tuyến toàn trình.',
      'Rút ngắn thời gian xử lý thủ tục hành chính liên ngành từ 30% đến 50%.',
      'Tích hợp toàn diện trên ứng dụng định danh điện tử VNeID.'
    ],
    tags: ['Cải cách hành chính', 'Chính phủ số', 'Dịch vụ công', 'Thời sự'],
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Tòa nhà cơ quan hành chính hiện đại',
    imageCaption: 'Bộ máy quản lý hành chính chuyển biến mạnh mẽ sang mô hình chính quyền phục vụ kiến tạo',
    imageCredit: 'Ảnh: TinVanta / Tuấn Anh'
  },
  {
    categorySlug: 'thoi-su',
    categoryName: 'Thời sự',
    headline: 'Chiến lược phát triển đô thị ven biển thích ứng với biến đổi khí hậu toàn cầu',
    sapo: 'Quy hoạch không gian ven biển quốc gia ưu tiên các công trình hạ tầng xanh, đê chắn sóng thông minh và bảo tồn hệ sinh thái rừng ngập mặn tự nhiên.',
    subheadings: [
      'Hạ tầng chống ngập kết hợp cảnh quan đô thị sinh thái',
      'Khai thác bền vững tài nguyên kinh tế biển',
      'Giải pháp tài chính và hợp tác quốc tế ứng phó nước biển dâng'
    ],
    quotes: 'Đô thị ven biển bền vững phải học cách sống hài hòa với thiên nhiên thay vì chỉ dựa vào các biện pháp công trình bê tông cứng nhắc.',
    speaker: 'PGS. TS Hoàng Đình Thọ',
    speakerRole: 'Viện Quy hoạch Đô thị và Hải đảo',
    keyPoints: [
      'Quy hoạch đồng bộ dải ven biển từ Quảng Ninh đến Kiên Giang.',
      'Phát triển hệ thống rừng chắn sóng ngập mặn đa mục tiêu.',
      'Tăng cường năng lực cảnh báo sớm thiên tai biển và sạt lở.'
    ],
    tags: ['Kinh tế biển', 'Biến đổi khí hậu', 'Quy hoạch đô thị', 'Thời sự'],
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Bờ biển và không gian đô thị hiện đại',
    imageCaption: 'Quy hoạch không gian biển hướng tới mục tiêu phát triển kinh tế gắn với bảo vệ môi trường sinh thái',
    imageCredit: 'Ảnh: TinVanta / Trần Nam'
  },

  // 2. KINH TẾ
  {
    categorySlug: 'kinh-te',
    categoryName: 'Kinh tế',
    headline: 'Thu hút dòng vốn FDI chất lượng cao vào các trung tâm đổi mới sáng tạo',
    sapo: 'Việt Nam đang định hình lại chiến lược thu hút FDI, hướng trọng tâm vào các tập đoàn công nghệ toàn cầu trong lĩnh vực bán dẫn, trung tâm dữ liệu và năng lượng tái tạo.',
    subheadings: [
      'Lợi thế cạnh tranh từ hạ tầng năng lượng xanh và nguồn nhân lực',
      'Chính sách ưu đãi thuế và cơ chế thử nghiệm Sandbox',
      'Gắn kết chặt chẽ doanh nghiệp FDI với chuỗi cung ứng nội địa'
    ],
    quotes: 'Dòng vốn ngoại thế hệ mới tìm kiếm sự ổn định thể chế và cam kết chuyển đổi xanh, đây là cơ hội vàng để Việt Nam nâng tầm vị thế trong chuỗi giá trị.',
    speaker: 'TS. Lê Anh Tuấn',
    speakerRole: 'Giám đốc Phân tích Kinh tế Vĩ mô',
    keyPoints: [
      'Vốn FDI đăng ký mới trong các ngành công nghệ cao tăng trưởng trên 25%.',
      'Thành lập các quỹ hỗ trợ đổi mới sáng tạo liên kết viện - trường - doanh nghiệp.',
      'Mục tiêu tỷ lệ nội địa hóa trong chuỗi công nghệ đạt trên 40% vào năm 2030.'
    ],
    tags: ['FDI', 'Kinh tế vĩ mô', 'Bán dẫn', 'Đầu tư nước ngoài'],
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Biểu đồ phân tích tài chính kinh tế',
    imageCaption: 'Chỉ số tăng trưởng kinh tế duy trì đà bứt phá ấn tượng nhờ dòng vốn đầu tư chiến lược',
    imageCredit: 'Ảnh: Getty / TinVanta'
  },
  {
    categorySlug: 'kinh-te',
    categoryName: 'Kinh tế',
    headline: 'Thị trường chứng khoán hướng tới mục tiêu nâng hạng: Cơ hội bứt phá thanh khoản',
    sapo: 'Các cơ quan quản lý quyết liệt tháo gỡ nút thắt ký quỹ trước giao dịch (pre-funding) và mở rộng room ngoại, tạo đà đón dòng tiền hàng tỷ USD từ các quỹ đầu tư quốc tế.',
    subheadings: [
      'Hoàn thiện hệ thống giao dịch mới KRX và bù trừ thanh toán',
      'Minh bạch thông tin bằng tiếng Anh đối với doanh nghiệp niêm yết',
      'Tác động tích cực tới định giá của nhóm cổ phiếu trụ cột'
    ],
    quotes: 'Nâng hạng thị trường không chỉ mang lại dòng vốn ngoại dồi dào mà còn chuẩn hóa toàn bộ tính kỷ luật và quản trị của thị trường vốn Việt Nam.',
    speaker: 'Phạm Quang Minh',
    speakerRole: 'Chuyên gia Chiến lược Đầu tư',
    keyPoints: [
      'Đáp ứng đầy đủ các tiêu chuẩn khắt khe từ FTSE Russell và MSCI.',
      'Triển khai cơ chế Non-prefunding cho nhà đầu tư tổ chức nước ngoài.',
      'Dự báo thu hút ròng từ 3 - 5 tỷ USD ngay trong năm đầu nâng hạng.'
    ],
    tags: ['Chứng khoán', 'Thị trường vốn', 'Nâng hạng thị trường', 'Đầu tư'],
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Sàn giao dịch chứng khoán hiện đại',
    imageCaption: 'Thị trường chứng khoán Việt Nam ghi nhận sự tham gia mạnh mẽ của dòng vốn đầu tư quốc tế',
    imageCredit: 'Ảnh: Bloomberg / TinVanta'
  },

  // 3. CÔNG NGHỆ
  {
    categorySlug: 'cong-nghe',
    categoryName: 'Công nghệ',
    headline: 'Bùng nổ ứng dụng Trí tuệ nhân tạo tạo sinh (GenAI) trong sản xuất và dịch vụ',
    sapo: 'Không còn là thử nghiệm, hơn 60% doanh nghiệp vừa và lớn tại Việt Nam đã tích hợp các mô hình ngôn ngữ lớn (LLM) để tối ưu vận hành và tự động hóa quy trình chăm sóc khách hàng.',
    subheadings: [
      'Tự động hóa tác vụ tri thức và giải phóng sức sáng tạo',
      'Phát triển mô hình AI bản địa hóa tối ưu cho tiếng Việt',
      'Thách thức về an toàn dữ liệu và bản quyền công nghệ'
    ],
    quotes: 'Doanh nghiệp nào nắm bắt GenAI sớm sẽ nhân gấp nhiều lần năng suất lao động; ngược lại, sự chậm trễ sẽ khiến lợi thế cạnh tranh bị đào thải nhanh chóng.',
    speaker: 'TS. Đặng Thanh Mai',
    speakerRole: 'Chuyên gia Trí tuệ Nhân tạo',
    keyPoints: [
      'Tiết kiệm từ 20 - 45% thời gian xử lý văn bản, hợp đồng và dịch vụ khách hàng.',
      'Nhiều mô hình AI tiếng Việt chuyên sâu được đào tạo và thương mại hóa thành công.',
      'Hình thành khung khổ pháp lý về đạo đức AI và bảo mật dữ liệu doanh nghiệp.'
    ],
    tags: ['Trí tuệ nhân tạo', 'GenAI', 'Chuyển đổi số', 'Công nghệ'],
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Mô hình trí tuệ nhân tạo AI và mạng nơ-ron',
    imageCaption: 'AI tạo sinh đang tạo nên bước ngoặt thay đổi toàn diện phương thức làm việc và sáng tạo',
    imageCredit: 'Ảnh: TinVanta / Lê Mai'
  },
  {
    categorySlug: 'cong-nghe',
    categoryName: 'Công nghệ',
    headline: 'Thương mại hóa mạng di động 5G toàn quốc: Đòn bẩy cho nền kinh tế số',
    sapo: 'Mạng di động 5G với tốc độ siêu nhanh và độ trễ cực thấp chính thức phủ sóng các khu công nghiệp, cảng biển và trung tâm đô thị lớn trên toàn quốc.',
    subheadings: [
      'Kết nối vạn vật (IoT) trong sản xuất thông minh',
      'Ứng dụng 5G trong y tế từ xa và vận tải tự hành',
      'Cơ hội lớn cho hệ sinh thái startup phần cứng và phần mềm IoT'
    ],
    quotes: '5G là xa lộ số của thời đại mới. Đó là nền tảng sống còn cho nhà máy thông minh, logistics hiện đại và dịch vụ đô thị tương lai.',
    speaker: 'Vũ Đức Thành',
    speakerRole: 'Kỹ sư trưởng Viễn thông',
    keyPoints: [
      'Độ trễ giảm xuống dưới 5ms, tốc độ truyền tải nhanh gấp 20 lần so với 4G.',
      'Hỗ trợ kết nối đồng thời hơn 1 triệu thiết bị trên mỗi kilomet vuông.',
      'Mở ra không gian kinh doanh mới trị giá hàng tỷ USD cho hệ sinh thái số.'
    ],
    tags: ['Mạng 5G', 'Viễn thông', 'Internet of Things', 'Chuyển đổi số'],
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Hạ tầng trạm phát sóng viễn thông hiện đại',
    imageCaption: 'Hạ tầng mạng 5G tốc độ cao mở đường cho các ứng dụng công nghiệp và đô thị tương lai',
    imageCredit: 'Ảnh: TinVanta / Hoàng Quân'
  },

  // 4. XÃ HỘI
  {
    categorySlug: 'xa-hoi',
    categoryName: 'Xã hội',
    headline: 'Mở rộng diện bao phủ nhà ở xã hội: Hiện thực hóa giấc mơ an cư của người lao động',
    sapo: 'Hàng loạt dự án nhà ở xã hội với hạ tầng tiện ích đồng bộ, trường học, trạm y tế được khởi công tại các vành đai đô thị, mang lại mái ấm cho hàng chục nghìn gia đình công nhân.',
    subheadings: [
      'Cắt giảm thủ tục mua nhà và gói tín dụng ưu đãi linh hoạt',
      'Đảm bảo chất lượng xây dựng tương đương nhà ở thương mại',
      'Kiến tạo môi trường sống nhân văn cho cộng đồng cư dân'
    ],
    quotes: 'Nhà ở xã hội không phải là giải pháp tạm bợ, mà là chính sách an sinh nền tảng để người lao động yên tâm cống hiến lâu dài.',
    speaker: 'Bà Nguyễn Thị Bích Liên',
    speakerRole: 'Hiệp hội Bất động sản An sinh',
    keyPoints: [
      'Mục tiêu hoàn thành hơn 1 triệu căn hộ nhà ở xã hội giai đoạn đến 2030.',
      'Gói lãi suất vay mua nhà cố định hỗ trợ người thu nhập thấp.',
      'Quy hoạch khép kín với đầy đủ công viên, nhà trẻ và trạm y tế.'
    ],
    tags: ['Nhà ở xã hội', 'An sinh xã hội', 'Đời sống dân sinh', 'Xã hội'],
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Khu chung cư đô thị hiện đại',
    imageCaption: 'Khu nhà ở an sinh được quy hoạch bài bản, mang lại không gian sống xanh và tiện nghi',
    imageCredit: 'Ảnh: TinVanta / Quốc Bảo'
  },

  // 5. GIÁO DỤC
  {
    categorySlug: 'giao-duc',
    categoryName: 'Giáo dục',
    headline: 'Đổi mới giáo dục đại học gắn liền với nhu cầu thực tiễn của thị trường lao động số',
    sapo: 'Các trường đại học hàng đầu chuyển mạnh sang mô hình đào tạo theo đơn đặt hàng doanh nghiệp, chú trọng kỹ năng tư duy phản biện, ngoại ngữ và năng lực giải quyết vấn đề.',
    subheadings: [
      'Chương trình thực tập trải nghiệm từ năm thứ hai',
      'Công nhận tín chỉ từ các chứng chỉ công nghệ quốc tế',
      'Khuyến khích tinh thần khởi nghiệp sáng tạo ngay trên giảng đường'
    ],
    quotes: 'Tấm bằng đại học thời đại số phải phản ánh năng lực hành động thực tế, khả năng thích ứng linh hoạt trước những thay đổi liên tục của công nghệ.',
    speaker: 'GS. TS Trần Minh Nghĩa',
    speakerRole: 'Hội đồng Giáo dục Quốc gia',
    keyPoints: [
      'Hơn 85% sinh viên tốt nghiệp có việc làm phù hợp chuyên ngành sau 6 tháng.',
      'Hợp tác đào tạo kép với hơn 500 tập đoàn công nghệ và sản xuất quốc tế.',
      'Nâng tỷ lệ môn học giảng dạy bằng tiếng Anh lên trên 40%.'
    ],
    tags: ['Giáo dục', 'Đại học', 'Kỹ năng số', 'Đào tạo nhân lực'],
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Sinh viên thảo luận nhóm trên giảng đường đại học',
    imageCaption: 'Môi trường đào tạo hiện đại khơi dậy tinh thần nghiên cứu và năng lực sáng tạo của thế hệ trẻ',
    imageCredit: 'Ảnh: TinVanta / Mai Hoa'
  },

  // 6. SỨC KHỎE
  {
    categorySlug: 'suc-khoe',
    categoryName: 'Sức khỏe',
    headline: 'Y tế cơ sở chuyển mình: Bác sĩ gia đình và hồ sơ sức khỏe điện tử toàn dân',
    sapo: 'Trạm y tế xã phường được nâng cấp trang thiết bị hiện đại và kết nối hội chẩn trực tuyến với các bệnh viện tuyến trung ương, giúp người dân an tâm khám chữa bệnh gần nhà.',
    subheadings: [
      'Quản lý bệnh không lây nhiễm ngay tại cộng đồng',
      'Ứng dụng hồ sơ bệnh án điện tử tích hợp căn cước công dân',
      'Chế độ đãi ngộ thu hút bác sĩ giỏi về tuyến cơ sở'
    ],
    quotes: 'Y tế cơ sở vững chắc chính là lá chắn hữu hiệu nhất bảo vệ sức khỏe nhân dân và giảm tải căn cơ cho các bệnh viện tuyến trên.',
    speaker: 'Bác sĩ CKII Lê Trọng Tín',
    speakerRole: 'Bệnh viện Đa khoa Quốc tế',
    keyPoints: [
      '100% người dân được lập hồ sơ sức khỏe điện tử đồng bộ dữ liệu quốc gia.',
      'Trang bị máy đo điện tim và siêu âm từ xa tại các trạm y tế vùng sâu vùng xa.',
      'Tỷ lệ chuyển tuyến điều trị các bệnh mãn tính thông thường giảm trên 35%.'
    ],
    tags: ['Sức khỏe', 'Y tế cơ sở', 'Bệnh án điện tử', 'Chăm sóc sức khỏe'],
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Bác sĩ kiểm tra sức khỏe và thăm khám bệnh nhân',
    imageCaption: 'Ứng dụng công nghệ số vào chẩn đoán và quản lý hồ sơ sức khỏe mang lại sự thuận tiện cho người dân',
    imageCredit: 'Ảnh: TinVanta / Y tế'
  },

  // 7. XE & GIAO THÔNG
  {
    categorySlug: 'xe',
    categoryName: 'Xe & Đời sống',
    headline: 'Bùng nổ xe điện và hạ tầng trạm sạc: Lối sống xanh định hình diện mạo giao thông',
    sapo: 'Thị phần ô tô điện và xe máy điện ghi nhận tốc độ tăng trưởng phi mã, kéo theo sự bứt phá của hệ sinh thái trạm sạc thông minh phủ khắp các tỉnh thành.',
    subheadings: [
      'Mạng lưới trạm sạc công cộng đạt mật độ kỷ lục',
      'Chính sách miễn giảm lệ phí trước bạ tiếp tục kích cầu tiêu dùng',
      'Tái chế và xử lý pin lithium theo chuẩn kinh tế tuần hoàn'
    ],
    quotes: 'Chuyển đổi giao thông xanh tại Việt Nam đang diễn ra nhanh hơn dự báo, tạo nên thói quen di chuyển văn minh, bảo vệ bầu không khí đô thị.',
    speaker: 'Kỹ sư Vũ Hải Đăng',
    speakerRole: 'Chuyên gia Công nghệ Ô tô',
    keyPoints: [
      'Xe điện chiếm hơn 20% lượng ô tô du lịch mới đăng ký trong năm nay.',
      'Khoảng cách trung bình giữa các điểm sạc trên cao tốc rút ngắn xuống dưới 30km.',
      'Thời gian sạc nhanh 10% - 80% dung lượng pin chỉ còn từ 18 đến 25 phút.'
    ],
    tags: ['Xe điện', 'Giao thông xanh', 'Trạm sạc', 'Ô tô'],
    imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Xe điện đang nạp năng lượng tại trạm sạc nhanh',
    imageCaption: 'Xu hướng xe điện thông minh góp phần giảm phát thải carbon và cải thiện môi trường sống đô thị',
    imageCredit: 'Ảnh: TinVanta / Xe'
  },

  // 8. THỂ THAO
  {
    categorySlug: 'the-thao',
    categoryName: 'Thể thao',
    headline: 'Đội tuyển bóng đá Việt Nam trẻ hóa đội hình: Khát vọng vươn tầm đấu trường châu lục',
    sapo: 'Ban huấn luyện trao cơ hội cho lứa cầu thủ U23 giàu tiềm năng, kết hợp lối chơi kỷ luật hiện đại và cường độ thi đấu đỉnh cao chuẩn bị cho các giải đấu quốc tế lớn.',
    subheadings: [
      'Xây dựng triết lý kiểm soát bóng và pressing tầm cao',
      'Tăng cường chuyên gia dinh dưỡng và thể lực chuyên sâu',
      'Đầu tư bài bản vào các học viện bóng đá trẻ trên toàn quốc'
    ],
    quotes: 'Lứa cầu thủ trẻ hiện nay có tư duy chiến thuật nhạy bén và thể hình vượt trội. Sự tự tin sẽ là chìa khóa để chúng ta cạnh tranh sòng phẳng với các đối thủ hàng đầu.',
    speaker: 'HLV Trưởng Đội tuyển',
    speakerRole: 'Ban Huấn Luyện Quốc Gia',
    keyPoints: [
      'Tập trung các gương mặt thi đấu xuất sắc nhất từ giải vô địch quốc gia V-League.',
      'Thi đấu giao hữu cọ xát với các đội tuyển hàng đầu Tây Á và Đông Á.',
      'Mục tiêu tiến sâu vào vòng loại cuối cùng World Cup khu vực châu Á.'
    ],
    tags: ['Bóng đá Việt Nam', 'Thể thao', 'V-League', 'Đội tuyển quốc gia'],
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Sân vận động bóng đá sôi động',
    imageCaption: 'Không khí tập luyện và thi đấu sôi nổi hướng tới các mục tiêu vinh quang của thể thao nước nhà',
    imageCredit: 'Ảnh: TinVanta / Thể thao'
  },

  // 9. GIẢI TRÍ
  {
    categorySlug: 'giai-tri',
    categoryName: 'Giải trí',
    headline: 'Công nghiệp âm nhạc và điện ảnh Việt Nam tự tin vươn ra thị trường quốc tế',
    sapo: 'Nhiều tác phẩm nghệ thuật, MV âm nhạc và phim điện ảnh Việt liên tục lập kỷ lục phòng vé, chinh phục các bảng xếp hạng streaming khu vực và liên hoan phim uy tín.',
    subheadings: [
      'Giao thoa giữa bản sắc văn hóa dân tộc và công nghệ sản xuất quốc tế',
      'Đầu tư chỉn chu vào kịch bản, âm thanh và kỹ xảo điện ảnh (VFX)',
      'Tiềm năng xuất khẩu sản phẩm văn hóa sáng tạo trị giá hàng tỷ USD'
    ],
    quotes: 'Khi chúng ta kể câu chuyện của văn hóa Việt Nam bằng ngôn ngữ điện ảnh hiện đại, thế giới sẽ hào hứng lắng nghe và đón nhận với sự trân trọng.',
    speaker: 'Đạo diễn Trần Anh Vũ',
    speakerRole: 'Nhà sản xuất Điện ảnh',
    keyPoints: [
      'Phim Việt chiếm thị phần áp đảo trên 55% doanh thu phòng vé nội địa.',
      'Nhiều sản phẩm âm nhạc lọt Top thịnh hành toàn cầu trên YouTube và Spotify.',
      'Chính sách ưu đãi thu hút các đoàn làm phim bom tấn quốc tế đến Việt Nam.'
    ],
    tags: ['Điện ảnh', 'Âm nhạc', 'Văn hóa nghệ thuật', 'Giải trí'],
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Sân khấu ca nhạc ánh sáng hiện đại',
    imageCaption: 'Các sản phẩm âm nhạc và nghệ thuật Việt Nam ngày càng khẳng định vị thế và sức hút mạnh mẽ',
    imageCredit: 'Ảnh: TinVanta / Văn hóa'
  },

  // 10. PHÁP LUẬT
  {
    categorySlug: 'phap-luat',
    categoryName: 'Pháp luật',
    headline: 'Hoàn thiện hành lang pháp lý bảo vệ dữ liệu cá nhân và an ninh mạng trong kỷ nguyên số',
    sapo: 'Các cơ quan thực thi pháp luật tăng cường thanh kiểm tra, xử lý nghiêm các hành vi mua bán trái phép dữ liệu cá nhân và lừa đảo trực tuyến sử dụng công nghệ cao.',
    subheadings: [
      'Nâng cao trách nhiệm tuân thủ của các tổ chức tài chính và doanh nghiệp số',
      'Tuyên truyền nâng cao kỹ năng tự bảo vệ của người dân trên không gian mạng',
      'Hợp tác quốc tế dẫn độ và xử lý tội phạm lừa đảo xuyên biên giới'
    ],
    quotes: 'Dữ liệu cá nhân là tài sản số vô giá. Bảo vệ dữ liệu cá nhân chính là bảo vệ quyền riêng tư và sự an toàn của từng công dân trong thời đại số.',
    speaker: 'Luật sư Nguyễn Văn Hòa',
    speakerRole: 'Đoàn Luật sư TP. Hà Nội',
    keyPoints: [
      'Triển khai quyết liệt Nghị định về bảo vệ dữ liệu cá nhân trên phạm vi toàn quốc.',
      'Xóa bỏ hàng nghìn trang web và tài khoản giả mạo lừa đảo tài chính.',
      'Thiết lập đường dây nóng tiếp nhận phản ánh vi phạm an toàn thông tin 24/7.'
    ],
    tags: ['Bảo vệ dữ liệu', 'An ninh mạng', 'Pháp luật', 'Luật số'],
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
    imageAlt: 'Cán cân công lý và sách luật',
    imageCaption: 'Hệ thống pháp luật được hoàn thiện nhằm bảo vệ quyền và lợi ích hợp pháp của người dân trên không gian số',
    imageCredit: 'Ảnh: TinVanta / Pháp luật'
  }
];
