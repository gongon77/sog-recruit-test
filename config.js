// サンプルでは応募先も外部計測も設定しません。公開時は運用確認後にここを更新してください。
window.SOG_CONFIG = Object.freeze({
  demoMode: true,
  lineUrl: null,
  pageMessages: Object.freeze({
    experienced: '経験者向け求人を見ました。報酬・待遇について相談したいです。',
    beginner: '未経験・Wワーク向け求人を見ました。昼職と両立できるか相談したいです。',
    staff: 'スタッフ紹介を見ました。お仕事や働き方について、スタッフの方に相談したいです。',
    simulator: '報酬シミュレーターを見ました。働き方について相談したいです。'
  }),
  pageParams: Object.freeze({ experienced: {}, beginner: {}, staff: {}, simulator: {} }),
  trackingEnabled: false,
  track(eventName) {
    // line_click / simulator_complete / beginner_link_click の接続口。
    // 相談文や個人情報を送らない。サンプルでは外部送信しない。
    if (!this.trackingEnabled) return;
    void eventName;
  }
});
