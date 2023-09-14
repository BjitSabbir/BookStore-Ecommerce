function successMessage(message, data = null) {
    return {
        success: true,
        message,
        data,
    }
}
function errorMessage(message) {
    return {
        success: false,
        message
    }
}
module.exports = {
    successMessage,
    errorMessage
}