
// 游戏状态定义
enum BottleState {
  DIRTY = 'DIRTY',         // 脏奶瓶
  CLEAN = 'CLEAN',         // 已擦干净
  POWDER_ADDED = 'POWDER_ADDED', // 已加粉
  WATER_ADDED = 'WATER_ADDED',   // 已加水 (混合)
  COMPLETED = 'COMPLETED'  // 完成 (已摇匀)
}

type ToolType = 'wipe' | 'powder' | 'water' | 'shake' | null;

Page({
  data: {
    bottleState: BottleState.DIRTY,
    selectedTool: null as ToolType,
    isHappy: false,
    instructionText: '奶瓶脏了，请先擦干净奶瓶',
    bottleStatusText: '脏奶瓶',
    bottleImage: '/images/bottle-dirty.png',
    babyImage: '/images/baby-hungry.png'
  },

  onLoad() {
    this.updateInstruction();
  },

  // 选择工具
  onSelectTool(e: any) {
    const tool = e.currentTarget.dataset.tool as ToolType;
    if (this.data.isHappy) return; // 游戏结束不能选工具

    this.setData({
      selectedTool: tool
    });
  },

  // 与奶瓶交互
  onInteractBottle() {
    const { bottleState, selectedTool } = this.data;

    if (this.data.isHappy) {
      wx.showToast({ title: '宝宝已经吃饱啦', icon: 'none' });
      return;
    }

    if (!selectedTool) {
      wx.showToast({ title: '请先选择一个工具', icon: 'none' });
      return;
    }

    switch (bottleState) {
      case BottleState.DIRTY:
        if (selectedTool === 'wipe') {
          this.playAction('正在擦拭...', () => {
            this.setData({
              bottleState: BottleState.CLEAN,
              bottleStatusText: '干净的奶瓶',
              bottleImage: '/images/bottle-clean.png'
            });
            this.updateInstruction();
          });
        } else {
          this.showError('奶瓶还很脏，先擦擦吧！');
        }
        break;

      case BottleState.CLEAN:
        if (selectedTool === 'powder') {
          this.playAction('正在倒入伊利奶粉...', () => {
            this.setData({
              bottleState: BottleState.POWDER_ADDED,
              bottleStatusText: '已加奶粉',
              bottleImage: '/images/bottle-powder.png'
            });
            this.updateInstruction();
          });
        } else if (selectedTool === 'water') {
            this.showError('先放奶粉再放水哦，比较好冲泡！');
        } else {
          this.showError('现在应该放奶粉了');
        }
        break;

      case BottleState.POWDER_ADDED:
        if (selectedTool === 'water') {
          this.playAction('正在倒入温水...', () => {
            this.setData({
              bottleState: BottleState.WATER_ADDED,
              bottleStatusText: '已加水(混合)',
              bottleImage: '/images/bottle-mixed.png'
            });
            this.updateInstruction();
          });
        } else {
          this.showError('已经加了奶粉，该加温水了');
        }
        break;

      case BottleState.WATER_ADDED:
        if (selectedTool === 'shake') {
          this.playAction('盖上盖子摇一摇...', () => {
            this.setData({
              bottleState: BottleState.COMPLETED,
              bottleStatusText: '冲调完成',
              bottleImage: '/images/bottle-completed.png',
              isHappy: true,
              babyImage: '/images/baby-happy.png',
              instructionText: '恭喜！宝宝吃饱喝足啦！'
            });
            // 成功弹窗
            wx.showModal({
              title: '任务完成',
              content: '宝宝很开心！',
              showCancel: false
            });
          });
        } else {
          this.showError('还没摇匀呢，容易结块哦');
        }
        break;
        
      case BottleState.COMPLETED:
        wx.showToast({ title: '已经完成啦！', icon: 'success' });
        break;
    }
  },

  // 辅助函数：播放动作模拟
  playAction(title: string, callback: () => void) {
    wx.showLoading({ title });
    setTimeout(() => {
      wx.hideLoading();
      callback();
      wx.vibrateShort({ type: 'medium' });
    }, 1000);
  },

  // 辅助函数：错误提示
  showError(msg: string) {
    wx.showToast({
      title: msg,
      icon: 'none'
    });
    wx.vibrateShort({ type: 'heavy' });
  },

  // 更新指引文字
  updateInstruction() {
    const { bottleState } = this.data;
    let text = '';
    switch (bottleState) {
      case BottleState.DIRTY:
        text = '第一步：用【擦一擦】把奶瓶擦干净';
        break;
      case BottleState.CLEAN:
        text = '第二步：倒入【伊利奶粉】';
        break;
      case BottleState.POWDER_ADDED:
        text = '第三步：倒入【温水】';
        break;
      case BottleState.WATER_ADDED:
        text = '第四步：【摇一摇】让奶粉溶解';
        break;
      case BottleState.COMPLETED:
        text = '宝宝吃饱喝足啦！';
        break;
    }
    this.setData({ instructionText: text });
  }
});
