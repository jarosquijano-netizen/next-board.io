# 🤖 Claude AI Setup Guide

NextBoard now uses **Anthropic's Claude AI** (Claude 3.5 Sonnet) for processing meeting transcripts!

---

## 🎭 Demo Mode (No API Key Required!)

**Good news!** You can test NextBoard **without any API keys**!

The app runs in **DEMO MODE** when no `ANTHROPIC_API_KEY` is set. It will:
- ✅ Show full UI/UX
- ✅ Upload files normally  
- ✅ Generate mock AI responses (5 sample cards)
- ✅ Test drag-and-drop Kanban board
- ✅ Export functionality works

**Perfect for testing the app before getting API keys!**

---

## 🔑 Get Anthropic Claude API Key

When you're ready for real AI processing:

### **Step 1: Sign Up**
Go to: https://console.anthropic.com/

### **Step 2: Get API Key**
1. Create account (free credits available!)
2. Go to **API Keys** section
3. Click **"Create Key"**
4. Copy your key (starts with `sk-ant-`)

### **Step 3: Add to Railway**
```bash
railway variables --set ANTHROPIC_API_KEY="sk-ant-your-key-here"
```

### **Step 4: Redeploy**
```bash
railway up
```

---

## 💰 Pricing

**Anthropic Claude 3.5 Sonnet:**
- **Input**: ~$3 per 1M tokens
- **Output**: ~$15 per 1M tokens

**Example costs:**
- Small transcript (1,000 words): ~$0.01
- Medium transcript (5,000 words): ~$0.05
- Large transcript (10,000 words): ~$0.10

**Much more affordable than GPT-4!**

Free credits usually provided for new accounts.

---

## 🆚 Why Claude Over OpenAI?

✅ **Better at following instructions**  
✅ **More accurate JSON output**  
✅ **Longer context window (200K tokens)**  
✅ **Lower cost**  
✅ **Latest model: Claude 3.5 Sonnet**  

---

## 🧪 Testing

### **Without API Key (Demo Mode)**
```bash
# Just deploy without ANTHROPIC_API_KEY
railway up

# You'll see demo responses
```

### **With API Key (Real Claude AI)**
```bash
# Set your key
railway variables --set ANTHROPIC_API_KEY="sk-ant-..."

# Deploy
railway up

# Test with real transcript processing!
```

---

## 🔄 Switch Between Demo and Real AI

### **Enable Demo Mode**
```bash
railway variables --unset ANTHROPIC_API_KEY
railway up
```

### **Enable Real AI**
```bash
railway variables --set ANTHROPIC_API_KEY="sk-ant-..."
railway up
```

---

## 📊 Demo Mode vs Real AI

| Feature | Demo Mode | Real AI |
|---------|-----------|---------|
| **UI/UX Testing** | ✅ Full | ✅ Full |
| **File Upload** | ✅ Works | ✅ Works |
| **AI Processing** | 🎭 Mock (5 cards) | 🤖 Real Claude |
| **Accuracy** | ❌ Generic | ✅ 95%+ accurate |
| **Customization** | ❌ Fixed | ✅ Extracts from your transcript |
| **Cost** | 💰 Free | 💰 ~$0.01-0.10 per transcript |

---

## 🎯 Recommended Workflow

1. **Deploy in Demo Mode first** (no API key)
2. **Test all features** (upload, drag-drop, export)
3. **Get Anthropic API key** when ready
4. **Set environment variable**
5. **Redeploy with real AI!**

---

## 🐛 Troubleshooting

### "Demo Mode" banner won't go away
```bash
# Make sure you set the key
railway variables

# Should show ANTHROPIC_API_KEY
# If not, set it:
railway variables --set ANTHROPIC_API_KEY="sk-ant-..."

# Redeploy
railway up
```

### API errors with Claude
- Check your key is correct
- Verify you have credits: https://console.anthropic.com/settings/billing
- Check API status: https://status.anthropic.com/

---

## 🎉 You're Ready!

**Deploy now in Demo Mode:**
```bash
railway up
```

**Add API key later:**
```bash
railway variables --set ANTHROPIC_API_KEY="sk-ant-..."
railway up
```

---

**Happy testing! 🚀**







