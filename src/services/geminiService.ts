import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateProductImage(
  base64Image: string,
  mimeType: string,
  style: string,
  productType: string,
  cameraAngle: string = "flattering natural angle"
): Promise<string | null> {
  try {
    const prompt = `A highly realistic and natural photograph of this ${productType} taken from a ${cameraAngle}. Remove the original background and seamlessly blend the jewelry into a ${style} environment. Use soft, natural lighting, authentic shadows, and realistic reflections. Avoid any artificial, overly polished, or CGI look. The image should look like a genuine, unedited lifestyle photo taken with a high-end camera.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating product image:", error);
    throw error;
  }
}

export async function generateTikTokScript(
  base64Image: string,
  mimeType: string,
  productType: string,
  style: string,
  angles: string[]
): Promise<string> {
  try {
    const anglesText = angles.join(', ');
    const prompt = `Bạn là một TikToker review trang sức/phụ kiện nữ cực kỳ chân thật và gần gũi.
Dựa vào hình ảnh ${productType} này, bối cảnh "${style}", và các góc quay sẽ có trong video: ${anglesText}.
Hãy viết một kịch bản TikTok ngắn gọn gồm 2 phần rõ ràng:

PHẦN 1: LỜI THOẠI (VOICE-OVER)
- Tổng độ dài lời thoại PHẢI DƯỚI 350 KÝ TỰ.
- Xưng hô: "tui" và "mấy bà". Bắt buộc dùng các cụm từ mộc mạc như "mấy bà ơi", "bà nào", "ta nói"...
- Văn phong: Chân thật, như đang tâm sự với bạn bè, tuyệt đối không giống văn mẫu quảng cáo.
- Cấu trúc: 
  + Mở đầu: Kêu gọi sự chú ý (VD: Mấy bà ơi, bà nào đang tìm...)
  + Thân: Khen 1 điểm nổi bật nhất của sản phẩm nhìn từ ảnh.
  + Chốt: Giục mua ở giỏ hàng góc trái.
- Thêm vài icon phù hợp nhưng đừng lạm dụng.

PHẦN 2: HƯỚNG DẪN GÓC QUAY (VISUALS)
- Liệt kê ngắn gọn cách sắp xếp các góc quay (${anglesText}) sao cho khớp với lời thoại ở Phần 1.
- Ghi rõ góc quay nào xuất hiện ở câu thoại nào để người dựng video dễ hình dung.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        temperature: 0.8,
      },
    });

    return response.text || "Không thể tạo kịch bản. Vui lòng thử lại.";
  } catch (error) {
    console.error("Error generating TikTok script:", error);
    throw error;
  }
}
