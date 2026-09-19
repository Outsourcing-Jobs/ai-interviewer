/**
 * @file scripts/seed/data/feedbackTemplates.ts
 * @description Templates for realistic AI interview evaluations and speech metrics
 */

export interface EvaluationSample {
  minScore: number;
  maxScore: number;
  feedbacks: string[];
}

export const EVALUATION_FEEDBACKS: EvaluationSample[] = [
  {
    minScore: 85,
    maxScore: 100,
    feedbacks: [
      "Xuất sắc! Câu trả lời rất gãy gọn, đi thẳng vào bản chất vấn đề. Bạn đã thể hiện tư duy kiến trúc sâu sắc, phân tích rõ ràng các trade-off và đưa ra phương án tối ưu hoá thực tiễn.",
      "Tuyệt vời. Phần trình bày có cấu trúc rõ ràng (STAR method), giải thích kỹ thuật chính xác và mã nguồn tối ưu về cả time complexity lẫn space complexity.",
      "Ấn tượng tốt. Ứng viên nắm rất vững các khái niệm nâng cao, trình bày lưu loát và tự tin, xử lý tốt các câu hỏi tình huống phức tạp."
    ],
  },
  {
    minScore: 65,
    maxScore: 84,
    feedbacks: [
      "Khá tốt. Bạn đã nêu được các ý chính và giải pháp cơ bản. Tuy nhiên, nên đào sâu hơn về cách xử lý edge cases và tối ưu hoá bộ nhớ khi dữ liệu tăng đột biến.",
      "Câu trả lời đạt yêu cầu kỹ thuật cơ bản. Phần giải thích code nên súc tích hơn và cần chú ý đến clean code và error handling toàn diện.",
      "Tốt. Cần cải thiện thêm về tốc độ trình bày và giảm bớt các từ đệm ngập ngừng để tăng tính thuyết phục."
    ],
  },
  {
    minScore: 40,
    maxScore: 64,
    feedbacks: [
      "Cần cải thiện. Câu trả lời còn chung chung và thiếu chiều sâu kỹ thuật. Cần ôn tập lại các khái niệm cốt lõi và thực hành viết code chuẩn chỉ hơn.",
      "Ứng viên có nắm sơ lược nhưng còn lúng túng khi đi vào chi tiết triển khai. Nên chuẩn bị kỹ hơn về các kịch bản thực tế và tối ưu hiệu năng."
    ],
  },
];

export const VIETNAMESE_FILLER_WORDS = [
  { word: "à", count: 2 },
  { word: "ừm", count: 3 },
  { word: "kiểu như", count: 1 },
  { word: "thì", count: 2 },
  { word: "là", count: 1 },
];

export const ENGLISH_FILLER_WORDS = [
  { word: "um", count: 2 },
  { word: "uh", count: 1 },
  { word: "like", count: 3 },
  { word: "you know", count: 2 },
];
