import { motion } from 'motion/react';
import '../styles/postal-robot-hero.css';

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export default function PostalRobotHero() {
  return (
    <section id="postal-hero" className="postal-robot-hero" aria-labelledby="postal-robot-title">
      <motion.div
        className="postal-robot-hero__video"
        aria-hidden="true"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <video
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
      </motion.div>

      <motion.div
        className="postal-robot-hero__footer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="postal-robot-hero__intro">
          <motion.p className="postal-robot-hero__eyebrow" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}><i />2025 · 邮政智能分拣项目</motion.p>
          <motion.h1 id="postal-robot-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>中邮分拣机器人<br />攻关与成果验证</motion.h1>
          <p className="postal-robot-hero__summary">围绕邮政包裹自动分拣场景，完成测试流程梳理、连续运行验证、成果记录整理与项目申报展示。</p>
          <motion.div className="postal-robot-hero__actions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <button type="button" className="postal-robot-hero__primary" onClick={() => scrollTo('project-results')}>查看项目成果</button>
            <button type="button" className="postal-robot-hero__secondary" onClick={() => scrollTo('project-details')}>了解项目过程</button>
          </motion.div>
        </div>
        <div className="postal-robot-hero__outcomes" aria-label="阶段成果">
          <span>抓取成功率 99.2%</span>
          <span>破损率 ≤ 0.5‰</span>
          <span>连续运行验证</span>
        </div>
      </motion.div>
    </section>
  );
}
