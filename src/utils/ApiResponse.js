class ApiResponse{
    constructor(statusCode , data , message = "success"){
        this.data = data
        this.message = message
        this.statusCode = statusCode
        this.success = statusCode < 400
    }
}

export {ApiResponse}