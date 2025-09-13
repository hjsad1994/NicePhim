'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function TaoPhongXemChungPage() {
  const [roomName, setRoomName] = useState<string>('Cùng xem Quái Vật Ngoài Hành Tinh: Địa Cầu nhé');
  const [autoStart, setAutoStart] = useState<boolean>(false);
  const [privateOnly, setPrivateOnly] = useState<boolean>(false);
  const posters = [
    {
      alt: 'poster 1',
      src: 'https://static.nutscdn.com/vimg/150-0/d5ffac77ba80757aa2813d8471c43f00.jpg',
    },
    {
      alt: 'poster 2',
      src: 'https://static.nutscdn.com/vimg/150-0/edbbf2dbb87cdb27a58f02ac45baebf3.jpg',
    },
    {
      alt: 'poster 3',
      src: 'https://static.nutscdn.com/vimg/150-0/f3b06d970f138f28cdb2e7244f5c6916.jpg',
    },
  ];
  const [activePoster, setActivePoster] = useState<number>(0);

  const handleCreate = () => {
    // TODO: integrate API create room
    alert('Đã tạo phòng: ' + roomName + (privateOnly ? ' (chỉ bạn bè)' : ' (công khai)'));
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--bg-2)'}}>
      <div className="w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <Link href="/xem-phim/quai-vat-ngoai-hanh-tinh-dia-cau.2k6kr6vG" className="btn btn-circle btn-outline border-2 border-gray-400/30 text-white hover:bg-white/10" aria-label="Quay lại">
            <span className="i-fa6-solid-angle-left" aria-hidden />
          </Link>
          <h3 className="category-name text-white text-2xl font-semibold">Tạo phòng xem chung</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Movie detail */}
          <div className="border-2 border-gray-400/15 rounded-lg p-5" style={{backgroundColor: 'var(--bg-3)'}}>
            <div className="flex gap-5">
              <div className="div-poster w-[140px] shrink-0">
                <div className="v-thumbnail relative w-[140px] h-[200px] overflow-hidden rounded-md border border-gray-500/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Xem Phim Quái Vật Ngoài Hành Tinh: Địa Cầu Vietsub HD Online - Rophim"
                    loading="lazy"
                    src="https://static.nutscdn.com/vimg/500-0/d5ffac77ba80757aa2813d8471c43f00.jpg"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="info flex-1">
                <h2 className="heading-sm media-name text-white text-xl font-semibold leading-snug">
                  <Link
                    title="Quái Vật Ngoài Hành Tinh: Địa Cầu"
                    href="/phim/quai-vat-ngoai-hanh-tinh-dia-cau.2k6kr6vG"
                    className="hover:text-red-400"
                  >
                    Quái Vật Ngoài Hành Tinh: Địa Cầu
                  </Link>
                </h2>
                <div className="alias-name mb-3 text-red-400">Alien: Earth</div>
                <div className="detail-more space-y-3 text-gray-300">
                  <div className="hl-tags flex items-center gap-2">
                    <div className="tag-model"><span className="last inline-block px-2 py-0.5 rounded bg-gray-600/40 text-white text-xs"><strong>T18</strong></span></div>
                    <div className="tag-classic"><span className="inline-block px-2 py-0.5 rounded bg-gray-600/40 text-white text-xs">2025</span></div>
                    <div className="tag-classic"><span className="inline-block px-2 py-0.5 rounded bg-gray-600/40 text-white text-xs">Phần 1</span></div>
                    <div className="tag-classic"><span className="inline-block px-2 py-0.5 rounded bg-gray-600/40 text-white text-xs">Tập 5</span></div>
                  </div>
                  <div className="hl-tags flex flex-wrap items-center gap-2">
                    {['Chính Kịch','Hành Động','Kỳ Ảo','Viễn Tưởng','Phiêu Lưu'].map((t)=> (
                      <Link key={t} href="#" className="tag-topic inline-block text-xs px-2 py-0.5 rounded border border-gray-400/30 text-gray-200 hover:bg-white/10">{t}</Link>
                    ))}
                  </div>
                  <div className="description text-sm text-gray-300/90 leading-relaxed">
                    Con tàu nghiên cứu vũ trụ USCSS Maginot bất ngờ rơi xuống Trái Đất, mang theo một bí ẩn chưa từng được biết đến. Wendy cùng nhóm lính tinh nhuệ đã phát hiện ra một bí mật định mệnh, đưa họ đối mặt với mối đe dọa khủng khiếp nhất hành tinh.
                  </div>
                  <div className="buttons mt-2">
                    <div className="btn btn-outline inline-flex items-center gap-2 rounded-full border-2 border-gray-400/30 text-white px-4 py-2">
                      <span className="i-fa6-solid-play" aria-hidden />
                      <span>Phần 1 - Tập 5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="border-2 border-gray-400/15 rounded-lg p-5" style={{backgroundColor: 'var(--bg-3)'}}>
            {/* 1. Name */}
            <div className="step-row is-name mb-6">
              <div className="step-name mb-3 text-white">1. Tên phòng</div>
              <div className="form-group">
                <input
                  className="form-control size-lg v-form-control w-full rounded-lg bg-black/20 border-2 border-gray-400/30 text-white placeholder:text-gray-400 px-4 py-3 outline-none focus:border-red-500/80"
                  placeholder="Nhập tên phòng"
                  maxLength={100}
                  minLength={10}
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />
              </div>
            </div>

            {/* 2. Poster */}
            <div className="step-row is-poster mb-6">
              <div className="flex items-start justify-between gap-4 w-full">
                <div className="flex flex-col flex-grow">
                  <div className="step-name text-white">2. Chọn poster hiển thị</div>
                </div>
                <div className="d-poster flex items-center gap-3">
                  {posters.map((p, idx) => (
                    <button
                      key={p.src}
                      type="button"
                      onClick={() => setActivePoster(idx)}
                      className={`item ${activePoster === idx ? 'ring-2 ring-red-500/80' : ''} rounded-md overflow-hidden`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt={p.alt} loading="lazy" src={p.src} className="v-thumbnail w-[90px] h-[90px] object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Time */}
            <div className="step-row is-time mb-6">
              <div className="step-name text-white">3. Cài đặt thời gian</div>
              <p className="step-desc text-gray-400">Có thể bắt đầu thủ công hoặc tự động theo thời gian cài đặt.</p>
              <div className="start-manual mt-2">
                <button
                  type="button"
                  onClick={() => setAutoStart((v) => !v)}
                  className="line-center inline-flex items-center gap-2"
                >
                  <div className={`toggle-x relative w-12 h-6 rounded-full transition-colors ${autoStart ? 'bg-red-500/80' : 'bg-gray-600/60'}`}>
                    <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-all ${autoStart ? 'translate-x-6' : ''}`}></span>
                  </div>
                  <div className="text text-gray-200">Tôi muốn bắt đầu tự động</div>
                </button>
              </div>
            </div>

            {/* 4. Privacy */}
            <div className="step-row is-public mb-2">
              <div className="flex items-center w-full mb-2 gap-4">
                <div className="step-name mb-0 flex-grow text-white">4. Bạn chỉ muốn xem với bạn bè?</div>
                <button
                  type="button"
                  onClick={() => setPrivateOnly((v) => !v)}
                  className="v-toggle"
                >
                  <div className={`toggle-x relative w-12 h-6 rounded-full transition-colors ${privateOnly ? 'bg-red-500/80' : 'bg-gray-600/60'}`}>
                    <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-all ${privateOnly ? 'translate-x-6' : ''}`}></span>
                  </div>
                </button>
              </div>
              <p className="step-desc text-gray-400 mb-0">Nếu bật, chỉ có thành viên có link mới xem được phòng này.</p>
            </div>

            {/* Submit */}
            <div className="is-submit mt-5">
              <div className="buttons flex items-center gap-3 w-full">
                <button
                  className="btn btn-xl btn-primary flex-grow rounded-full border-2 border-red-500/80 bg-red-500/10 hover:bg-red-500/20 text-white py-3"
                  onClick={handleCreate}
                >
                  Tạo phòng
                </button>
                <Link
                  className="btn btn-xl btn-light rounded-full border-2 border-gray-400/30 text-white hover:bg-white/10 py-3 px-6"
                  href="/xem-phim/quai-vat-ngoai-hanh-tinh-dia-cau.2k6kr6vG"
                >
                  Huỷ bỏ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

