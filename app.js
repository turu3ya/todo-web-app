// タスク追加
document.getElementById('taskForm').addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('taskName').value;
  const freq = document.getElementById('frequency').value;
  const category = document.getElementById('category').value;
  const nextDate = calculateNextDate(freq, new Date());

  await tasksCollection.add({
    name,
    frequency: freq,
    category,
    nextDate: nextDate.toISOString(),
    done: false
  });

  document.getElementById('taskForm').reset();
});

// 次回予定日を計算
function calculateNextDate(freq, fromDate) {
  const date = new Date(fromDate);
  if (freq === 'daily') {
    date.setDate(date.getDate() + 1);
  } else if (freq === 'weekly') {
    date.setDate(date.getDate() + 7);
  } else if (freq === 'biweekly') {
    date.setDate(date.getDate() + 14);
  } else if (freq === 'once') {
    // 完了時に再表示しない＝遠い未来に設定
    date.setFullYear(date.getFullYear() + 100);
  }
  return date;
}

// タスク表示＆完了操作
tasksCollection.onSnapshot(snapshot => {
  const list = document.getElementById('taskList');
  list.innerHTML = '';
  snapshot.forEach(doc => {
    const data = doc.data();
    const li = document.createElement('li');
    const check = document.createElement('input');
    check.type = 'checkbox';
    check.checked = data.done;

    check.addEventListener('change', async () => {
      const newNext = calculateNextDate(data.frequency, new Date());
      await tasksCollection.doc(doc.id).update({
        done: true,
        nextDate: newNext.toISOString()
      });
    });

    li.textContent = `${data.name}（${data.category}） 次回：${new Date(data.nextDate).toLocaleDateString()}`;
    li.prepend(check);
    list.append(li);
  });
});