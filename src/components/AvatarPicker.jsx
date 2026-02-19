"use client"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-provider"

const avatarCategories = {
  Attack_on_Titan: [
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305975/AOT_8_rosy3h.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305974/AOT_7_fi7vm2.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305972/AOT_6_e0mv9u.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305971/AOT_5_hiilfv.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305966/AOT_4_xpdk1j.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305964/AOT_3_yzbt3z.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305963/AOT_2_ckl2ob.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305962/AOT_1_mdihwv.jpg",
  ],
  Black_Clover: [
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771306008/black_clover_9_v8bz3c.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771306006/black_clover_8_uzmsgl.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771306004/black_clover_7_osasw9.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771306003/black_clover_6_umw01k.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771306001/black_clover_5_jgyjr2.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305999/black_clover_4_bufkt4.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305998/black_clover_3_q80tt1.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305996/black_clover_2_ukhyl7.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305995/black_clover_1_qeixwd.jpg",
  ],
  Hunter_X_Hunter: [
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305941/HxH_9_lrpfsv.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305939/HxH_8_xbzwqe.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305938/HxH_7_mio00j.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305938/HxH_6_gtcbdk.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305933/HxH_5_getle5.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305932/HxH_4_fgmafa.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305930/HxH_3_icg41j.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305929/HxH_2_l02jqp.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305928/HxH_1_nbgqqv.jpg",
  ],
  JJK: [
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305912/jjk_13_q1gumf.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305912/jjk_12_memp13.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305910/jjk_11_ubttqq.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305909/jjk_10_issnfc.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305907/jjk_9_dwyhne.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305906/jjk_8_dwpdq6.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305905/jjk_7_k8u64m.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305901/jjk_6_njmnut.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305900/jjk_5_dcljbd.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305899/jjk_4_svgcom.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305898/jjk_3_ijtgpz.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305896/jjk_2_a2x9fy.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305896/jjk_1_b6edkk.jpg",
  ],
  Naruto: [
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305872/naruto_14_esvija.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305871/naruto_13_ewxrqk.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305871/naruto_12_v3821m.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305867/naruto_11_qrz21i.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305866/naruto_10_qxf3d8.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305865/naruto_9_kaisse.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305863/naruto_8_aucmm9.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305862/naruto_7_ofhb08.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305862/naruto_6_d5jobr.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305860/naruto_5_w6js8s.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305859/naruto_4_woyide.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305858/naruto_3_u29nrx.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305858/naruto_2_qvjqda.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305857/naruto_1_lkdowq.jpg",
  ],
  One_Piece: [
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305833/one_piece_11_itfgms.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305833/one_piece_10_x96js9.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305832/one_piece_9_v2su4x.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305828/one_piece_8_gll46r.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305827/one_piece_7_cbnz6f.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305827/one_piece_6_qppmi2.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305826/one_piece_5_j9b0p3.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305825/one_piece_4_thztao.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305824/one_piece_3_hexrnq.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305823/one_piece_2_eoopdo.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305822/One_piece_1_h3pqrm.jpg",
  ],
  One_Punch_man: [
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305782/One_punch_man_7_sdhrie.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305781/One_punch_man_6_tkopxv.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305780/One_punch_man_5_puhlw7.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305779/One_punch_man_4_tg9lwb.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305779/One_punch_man_3_iakqih.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305778/One_punch_man_2_ykiuaf.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305778/One_punch_man_1_axnhxj.jpg",
  ],
  Sakamoto: [
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305717/Sakamoto_11_fwwwnj.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305716/Sakamoto_10_zdehfh.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305716/Sakamoto_9_en2txg.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305715/Sakamoto_8_yljgtl.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305715/Sakamoto_7_l9mrr1.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305714/Sakamoto_6_qtlldm.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305714/Sakamoto_5_xvwoxr.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305713/Sakamoto_4_qxyl5k.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305713/Sakamoto_3_odbxxm.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305713/Sakamoto_2_yjjipb.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305712/Sakamoto_1_itkrqj.jpg",
  ],
  Solo_leveling: [
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305667/Solo_leveling_9_xjrpeb.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305667/Solo_leveling_10_iog5de.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305667/Solo_leveling_7_yhtdsd.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305667/Solo_leveling_8_ihfctv.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305666/Solo_leveling_6_w3a02z.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305666/Solo_leveling_4_qihtta.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305666/Solo_leveling_5_jslsde.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305666/Solo_leveling_3_bjil0c.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305666/Solo_leveling_1_o0kupe.jpg",
    "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305666/Solo_leveling_2_nct62k.jpg",
  ]
}

export default function AvatarPicker({
  open,
  onOpenChange,
  setOpen,
  selectedAvatar,
}) {
  const categories = Object.keys(avatarCategories)
  const [selectedCategory, setSelectedCategory] = useState(categories[0])

  const {updateProfile} = useAuth();

  const handleSelect = async(url) => {
    await updateProfile({
      avatar: url
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] bg-[#0f172a] border-gray-800 p-0 gap-0 overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between p-6 pb-4 shrink-0">
          <DialogTitle className="text-2xl font-bold text-white tracking-tight">
            Select Your Avatar
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 overflow-hidden flex flex-col min-h-0">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className=" flex flex-col min-h-0">
            {/* CATEGORY BUTTONS - Wrap to next line instead of scroll */}
            <TabsList className="flex flex-wrap w-full gap-2 h-auto mb-6 bg-[#1e293b] rounded-xl shrink-0">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="text-sm font-medium transition-all duration-200 whitespace-nowrap px-2 rounded-lg text-gray-400 hover:text-white data-[state=active]:text-white data-[state=active]:bg-white/10 cursor-pointer"
                >
                  {category.replace(/_/g, " ")}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* AVATAR GRIDS - Scrollable container */}
            <div className="overflow-y-auto min-h-0 pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {categories.map((category) => (
                <TabsContent key={category} value={category} className="mt-0">
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                    {avatarCategories[category].map((url, idx) => (
                      <Card
                        key={`${category}-${idx}`}
                        onClick={() => handleSelect(url)}
                        className={cn(
                          "cursor-pointer overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95",
                          "border-2 hover:border-blue-500/50 bg-[#1e293b] border-gray-700/50 py-0 rounded-full",
                          selectedAvatar === url
                            ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-[#0f172a] scale-105 border-blue-500 shadow-lg shadow-blue-500/20"
                            : ""
                        )}
                      >
                        <Avatar className="w-full h-full aspect-square">
                          <AvatarImage
                            src={url}
                            alt={`${category} avatar ${idx + 1}`}
                            className="object-contain"
                            loading="lazy"
                          />
                        </Avatar>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}